// ✅ Fetch quota + user info
async function fetchQuotaAndUser() {
  try {
    const res = await fetch("http://localhost:3000/api/prompt/use", {
      method: "GET",
      credentials: "include"
    })

    const data = await res.json()
    console.log("API Response:", data)

    if (data.error) {
      document.getElementById("userEmail").innerText = "Not logged in"
      document.getElementById("quotaDisplay").innerText = "Please login first."
      return
    }

    if (data.quota) {
      const remaining = data.quota.free_prompts - data.quota.used_prompts

      // ✅ User Email
      document.getElementById("userEmail").innerText = `Logged in as: ${data.quota.email}`

      // ✅ Quota display logic
      if (remaining > 0) {
        document.getElementById("quotaDisplay").innerText =
          `Remaining Prompts: ${remaining}/${data.quota.free_prompts}`
      } else {
        document.getElementById("quotaDisplay").innerHTML = `
          <span style="color:red;font-weight:bold;">You’ve used all free prompts!</span><br/>
          <button id="upgradeInlineBtn" style="margin-top:5px;padding:5px 10px;background:green;color:white;border:none;border-radius:4px;cursor:pointer;">
            Upgrade Plan
          </button>
        `
        // Inline Upgrade button click
        document.getElementById("upgradeInlineBtn").addEventListener("click", () => {
          chrome.tabs.create({ url: "http://localhost:3000/dashboard?upgrade=true" })
        })
      }
    }
  } catch (err) {
    console.error("Error fetching quota:", err)
    document.getElementById("quotaDisplay").innerText = "Error fetching quota."
  }
}

// ✅ Login button
document.getElementById("loginBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000" })
})

// ✅ Upgrade Plan button (main)
document.getElementById("upgradeBtn").addEventListener("click", () => {
  chrome.tabs.create({ url: "http://localhost:3000/dashboard?upgrade=true" })
})

// ✅ Generate Prompt
document.getElementById("generatePromptBtn").addEventListener("click", async () => {
  try {
    const res = await fetch("http://localhost:3000/api/prompt/use", {
      method: "POST",
      credentials: "include"
    })
    const data = await res.json()
    console.log("Prompt used:", data)
    fetchQuotaAndUser()
  } catch (err) {
    console.error("Error using prompt:", err)
  }
})

// ✅ Clear
document.getElementById("clearBtn").addEventListener("click", () => {
  document.getElementById("promptBox").value = ""
})

// ✅ Capture Selected
document.getElementById("captureBtn").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => window.getSelection().toString()
      },
      (results) => {
        if (results && results[0] && results[0].result) {
          document.getElementById("promptBox").value = results[0].result
        }
      }
    )
  })
})

// ✅ Page load
document.addEventListener("DOMContentLoaded", fetchQuotaAndUser)
