
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

// Modal elements
const emailModal = document.getElementById("email-modal");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");
const resendSection = document.getElementById("resend-section");
const resendBtn = document.getElementById("resend-btn");
const resendText = document.getElementById("resend-text");
const timerText = document.getElementById("timer-text");

let resendTimer = null;
let currentUserEmail = null;

// Toggle between sign in and sign up
toggleAuthBtn.addEventListener("click", () => {
    isSignUp = !isSignUp;
    toggleAuthBtn.textContent = isSignUp ? "I already have an account" : "I don't have an account";
    authSubtitle.textContent = isSignUp ? "Create your account" : "Sign in to start creating notes";
    submitBtn.textContent = isSignUp ? "Sign Up" : "Sign In";
    
    // Show/hide password requirements
    if (window.togglePasswordRequirements) {
        window.togglePasswordRequirements(isSignUp);
    }
});

// Handle email/password auth
authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showEmailModal("Missing Information", "Please enter both email and password to continue.");
        return;
    }

    try {
        if (isSignUp) {
            // Validate password before creating account
            if (window.validatePassword && !window.validatePassword(password)) {
                showEmailModal("Password Requirements", "Please ensure your password meets all the requirements shown below the password field.");
                return;
            }
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            
            showEmailModal(
                "Verification Email Sent!", 
                "We've sent a verification email to your inbox. Please verify your email before signing in to access your account.",
                true,
                email
            );
            
            isSignUp = false;
            toggleAuthBtn.textContent = "I don't have an account";
            authSubtitle.textContent = "Sign in to start creating notes";
            submitBtn.textContent = "Sign In";
            
            // Hide password requirements after successful sign up
            if (window.togglePasswordRequirements) {
                window.togglePasswordRequirements(false);
            }
        } else {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (!userCredential.user.emailVerified) {
                showEmailModal(
                    "Email Verification Required", 
                    "Please verify your email before signing in. Check your inbox for the verification email.",
                    true,
                    email
                );
                return;
            }
            window.location.href = "/dash.html";
        }
    } catch (error) {
        showEmailModal("Authentication Error", error.message);
    }
});

// Handle Google sign in
googleSigninBtn.addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        console.log("Signed in user:", result.user);
        window.location.href = "/dash.html";
    } catch (error) {
        console.error("Error signing in:", error.message);
        showEmailModal("Google Sign-In Error", "Failed to sign in with Google: " + error.message);
    }
});

// Modal functions
function showEmailModal(title, message, showResend = false, email = null) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    currentUserEmail = email;
    
    if (showResend && email) {
        resendSection.classList.remove("hidden");
        startResendTimer();
    } else {
        resendSection.classList.add("hidden");
    }
    
    emailModal.classList.remove("hidden");
}

function hideEmailModal() {
    emailModal.classList.add("hidden");
    if (resendTimer) {
        clearInterval(resendTimer);
        resendTimer = null;
    }
    resetResendButton();
}

function startResendTimer() {
    let seconds = 60;
    resendBtn.disabled = true;
    resendBtn.classList.add("disabled:bg-gray-400", "disabled:cursor-not-allowed");
    
    function updateTimer() {
        if (seconds > 0) {
            resendText.textContent = `Resend Email (${seconds}s)`;
            timerText.textContent = `You can resend in ${seconds} seconds`;
            timerText.classList.remove("hidden");
            seconds--;
        } else {
            resetResendButton();
            clearInterval(resendTimer);
            resendTimer = null;
        }
    }
    
    updateTimer();
    resendTimer = setInterval(updateTimer, 1000);
}

function resetResendButton() {
    resendBtn.disabled = false;
    resendBtn.classList.remove("disabled:bg-gray-400", "disabled:cursor-not-allowed");
    resendText.textContent = "Resend Email";
    timerText.classList.add("hidden");
}

// Modal event listeners
modalClose.addEventListener("click", hideEmailModal);

resendBtn.addEventListener("click", async () => {
    if (currentUserEmail && !resendBtn.disabled) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, currentUserEmail, "temp");
            await sendEmailVerification(userCredential.user);
            // Delete the temporary user
            await userCredential.user.delete();
            
            showEmailModal(
                "Email Sent Again!", 
                "A new verification email has been sent to your inbox. Please check your email and verify your account.",
                true,
                currentUserEmail
            );
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                // User already exists, try to get the current user and resend
                try {
                    const user = auth.currentUser;
                    if (user) {
                        await sendEmailVerification(user);
                        showEmailModal(
                            "Email Sent Again!", 
                            "A new verification email has been sent to your inbox. Please check your email and verify your account.",
                            true,
                            currentUserEmail
                        );
                    }
                } catch (resendError) {
                    console.error("Error resending email:", resendError);
                    alert("Error resending verification email: " + resendError.message);
                }
            } else {
                console.error("Error resending email:", error);
                alert("Error resending verification email: " + error.message);
            }
        }
    }
});

// Handle forgot password
forgotPasswordBtn.addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    if (!email) {
        showEmailModal("Email Required", "Please enter your email address to reset your password.");
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        showEmailModal(
            "Password Reset Sent", 
            "Password reset email sent successfully! Please check your inbox and follow the instructions to reset your password."
        );
    } catch (error) {
        showEmailModal("Error", error.message);
    }
});
