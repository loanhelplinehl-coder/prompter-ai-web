// lib/stripe.js - Stripe integration for billing (placeholder)

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe checkout session for Pro plan upgrade
 * @param {string} userId - User ID from Supabase
 * @param {string} userEmail - User email
 * @returns {Promise<Object>} Stripe checkout session
 */
async function createCheckoutSession(userId, userEmail) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Prompter AI Pro Plan',
              description: 'Monthly subscription with 1,000 optimized prompts',
            },
            unit_amount: 999, // $9.99 in cents
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?canceled=true`,
      customer_email: userEmail,
      metadata: {
        userId: userId,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
}

/**
 * Handle Stripe webhook events
 * @param {Object} event - Stripe webhook event
 * @param {Object} supabase - Supabase client
 */
async function handleWebhookEvent(event, supabase) {
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object, supabase);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, supabase);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, supabase);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('Error handling webhook event:', error);
    throw error;
  }
}

/**
 * Handle successful checkout completion
 * @param {Object} session - Stripe checkout session
 * @param {Object} supabase - Supabase client
 */
async function handleCheckoutCompleted(session, supabase) {
  const userId = session.metadata.userId;
  
  if (!userId) {
    throw new Error('No user ID in session metadata');
  }

  // Update user profile to Pro
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      is_pro: true,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  // Create or update subscription record
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: userId,
      stripe_customer_id: session.customer,
      stripe_subscription_id: session.subscription,
      status: 'active',
      plan_type: 'pro',
      current_period_start: new Date(session.subscription_details.current_period_start * 1000).toISOString(),
      current_period_end: new Date(session.subscription_details.current_period_end * 1000).toISOString(),
    });

  if (subError) {
    throw subError;
  }

  console.log(`User ${userId} upgraded to Pro plan`);
}

/**
 * Handle subscription updates
 * @param {Object} subscription - Stripe subscription object
 * @param {Object} supabase - Supabase client
 */
async function handleSubscriptionUpdated(subscription, supabase) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    throw error;
  }

  // Update user profile based on subscription status
  const isPro = subscription.status === 'active';
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({ is_pro: isPro })
    .eq('user_id', subscription.metadata?.userId);

  if (profileError) {
    throw profileError;
  }
}

/**
 * Handle subscription cancellation
 * @param {Object} subscription - Stripe subscription object
 * @param {Object} supabase - Supabase client
 */
async function handleSubscriptionDeleted(subscription, supabase) {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    throw error;
  }

  // Downgrade user to free plan
  const { error: profileError } = await supabase
    .from('user_profiles')
    .update({ is_pro: false })
    .eq('user_id', subscription.metadata?.userId);

  if (profileError) {
    throw profileError;
  }
}

module.exports = {
  createCheckoutSession,
  handleWebhookEvent
};
