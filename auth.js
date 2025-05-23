
import { auth, provider } from "./firebase.js";
import { 
    signInWithPopup, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const googleSigninBtn = document.getElementById("google-signin-btn");
const authForm = document.getElementById("auth-form");
const toggleAuthBtn = document.getElementById("toggle-auth");
const forgotPasswordBtn = document.getElementById("forgot-password");
const authSubtitle = document.getElementById("auth-subtitle");
const submitBtn = document.getElementById("submit-btn");
let isSignUp = false;

// Toggle between sign in and sign up
toggleAuthBtn.addEventListener("click", () => {
    isSignUp = !isSignUp;
    toggleAuthBtn.textContent = isSignUp ? "I already have an account" : "I don't have an account";
    authSubtitle.textContent = isSignUp ? "Create your account" : "Sign in to start creating notes";
    submitBtn.textContent = isSignUp ? "Sign Up" : "Sign In";
});

// Handle email/password auth
authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter both email and password");
        return;
    }

    try {
        if (isSignUp) {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            alert("Verification email sent. Please verify your email before signing in.");
            isSignUp = false;
            toggleAuthBtn.textContent = "I don't have an account";
            authSubtitle.textContent = "Sign in to start creating notes";
            submitBtn.textContent = "Sign In";
        } else {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                alert("Please verify your email before signing in.");
                return;
            }
            window.location.href = "/index.html";
        }
    } catch (error) {
        alert(error.message);
    }
});

// Handle Google sign in
googleSigninBtn.addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("Signed in user:", result.user);
        window.location.href = "/index.html";
    } catch (error) {
        console.error("Error signing in:", error.message);
        alert("Failed to sign in with Google: " + error.message);
    }
});

// Handle forgot password
forgotPasswordBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    if (!email) {
        alert("Please enter your email address");
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent. Please check your inbox.");
    } catch (error) {
        alert(error.message);
    }
});
