
import { auth, provider } from "./firebase.js";
import { signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const googleSigninBtn = document.getElementById("google-signin-btn");

googleSigninBtn.addEventListener("click", async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    console.log("Signed in user:", result.user);
    // Redirect to main page after successful sign in
    window.location.href = "/index.html";
  } catch (error) {
    console.error("Error signing in:", error.message);
    alert("Failed to sign in with Google: " + error.message);
  }
});
