import { useSignIn, useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import React, { createContext, useState, useContext } from "react";
import { ToastAndroid, Platform } from "react-native";
import { useToast } from "react-native-toast-notifications";

const AuthContext = createContext();

export const useAuthContext = () => useContext(AuthContext);

const initState = {
  emailAddress: "",
  password: "",
  emailCode: "",
  phoneNumber: "",
  phoneCode: "",
  status: "",
  identifier: "",
  oauthSignUp: null,
  resetPasswordCode: "",
};

export const AuthProvider = ({ children }) => {
  const {
    signUp,
    isLoaded: signUpLoaded,
    setActive: setSignUpActive,
  } = useSignUp();
  const {
    signIn,
    isLoaded: signInLoaded,
    setActive: setSignInActive,
  } = useSignIn();

  const [state, setState] = useState(initState);
  const toast = useToast();

  const updateState = (key, value) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  console.info({ status: state.status });

  const resetState = () => {
    // updateState("status", "");
    // updateState(initState);
  };

  const signUpWithEmail = async () => {
    if (!signUpLoaded) return;

    try {
      const result = await signUp.create({
        emailAddress: state.emailAddress,
        password: state.password,
      });

      console.info(result);

      const result2 = await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      console.info(result2);
      updateState("status", "confirmEmail");
    } catch (error) {
      console.error("Error during email sign-up:", error);
      showToast("Sign-up failed. Please try again.");
    }
  };

  const confirmEmail = async (code) => {
    if (!signUpLoaded) {
      showToast("System not ready. Please try again later.");
      return;
    }

    const fullCode = code || state.emailCode;

    try {
      await signUp.attemptEmailAddressVerification({
        code: fullCode,
      });

      if (signUp.emailAddress) {
        showToast("Email successfully verified!");
        updateState("status", "connectPhoneToAccount");
      } else {
        console.error("Email verification failed - no email address found");
        showToast("Email verification failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during email confirmation:", err);

      if (err.message.includes("invalid") || err.message.includes("code")) {
        showToast("Invalid verification code. Please check and try again.");
      } else if (err.message.includes("expired")) {
        showToast("Verification code has expired. Please request a new one.");
      } else {
        showToast("Email confirmation failed. Please try again later.");
      }
    }
  };

  const connectPhoneToAccount = async () => {
    if (!signUpLoaded) return;

    try {
      await signUp.update({ phoneNumber: state.phoneNumber });
      await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
      updateState("status", "confirmPhone");
    } catch (error) {
      console.error(error, "Phone verification error");
      showToast("Phone verification failed.");
    }
  };

  const confirmPhone = async (fullCode) => {
    if (!signUpLoaded) {
      showToast("System not ready. Please try again later.");
      return;
    }

    console.log("confirmPhone", fullCode);

    const code = fullCode || state.phoneCode;

    try {
      const result = await signUp.attemptPhoneNumberVerification({
        code,
      });

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        showToast("Phone number successfully verified!");
        updateState("status", "");
        router.push("/(root)/account-details");
      } else {
        console.error("Phone verification incomplete:", result.status);
        showToast("Verification incomplete. Please try again.");
      }
    } catch (error) {
      console.error("Error during phone confirmation:", error);

      if (error.message.includes("invalid") || error.message.includes("code")) {
        showToast(
          "Invalid verification code. Please check the code and try again."
        );
      } else if (error.message.includes("expired")) {
        showToast("Verification code has expired. Please request a new one.");
      } else if (error.message.includes("rate limit")) {
        showToast("Too many attempts. Please wait before trying again.");
      } else {
        showToast("Phone verification failed. Please try again later.");
      }
    }
  };

  const checkIdentifier = async () => {
    if (!signInLoaded) return;

    try {
      const identifier = state.identifier.trim();
      const isEmail = identifier.includes("@");
      console.log({ identifier });

      // Common validation for empty identifier
      if (!identifier) {
        showToast(
          "Please enter your email or phone number. This field cannot be empty."
        ); // More specific
        return;
      }

      if (isEmail) {
        updateState("emailAddress", identifier);
        const signInAttempt = await signIn.create({ identifier });

        const hasPasswordFactor = signInAttempt.supportedFirstFactors?.some(
          (f) => f.strategy === "password"
        );

        if (hasPasswordFactor) {
          updateState("status", "needPassword");
        } else {
          showToast(
            "This account doesn't support password login. Please try another method or contact support if you believe this is an error."
          ); // Clearer and offers a solution
        }
      } else {
        updateState("phoneNumber", identifier);
        const signInAttempt = await signIn.create({ identifier });

        const phoneCodeFactor = signInAttempt.supportedFirstFactors?.find(
          (f) => f.strategy === "phone_code"
        );

        if (!phoneCodeFactor) {
          showToast(
            "We can't send a verification code to this phone number. Please check the number or try another login method."
          ); // More user-friendly
          return;
        }

        await signIn.prepareFirstFactor({
          strategy: "phone_code",
          phoneNumberId: phoneCodeFactor.phoneNumberId,
        });

        updateState("status", "phoneVerification");
      }
    } catch (err) {
      console.error("Identifier check failed:", err);

      // Default user-friendly message
      let userMessage =
        "An unexpected error occurred during sign-in. Please try again.";

      const clerkError = err?.errors?.[0]; // Clerk specific error object

      if (clerkError) {
        // Prioritize Clerk's long_message if available and user-friendly
        if (clerkError.long_message && clerkError.long_message.length < 100) {
          // Avoid overly long technical messages
          userMessage = clerkError.long_message;
        } else if (clerkError.message) {
          // Fallback to Clerk's short message or specific checks
          if (clerkError.code === "form_identifier_not_found") {
            userMessage =
              "Account not found. Please double-check your email or phone number, or sign up if you're new.";
          } else if (
            clerkError.code === "form_param_format_invalid" &&
            clerkError.meta?.paramName === "phone_number"
          ) {
            userMessage =
              "The phone number format is invalid. Please enter a valid phone number (e.g., +1234567890).";
          } else if (
            clerkError.message.toLowerCase().includes("email address") ||
            clerkError.message.toLowerCase().includes("email_address")
          ) {
            userMessage =
              "The email address you entered is invalid. Please check the format (e.g., name@example.com).";
          } else if (
            clerkError.message.toLowerCase().includes("phone number")
          ) {
            userMessage =
              "The phone number you entered is invalid. Please check the format.";
          } else if (clerkError.message.length < 100) {
            // Use message if it's concise
            userMessage = clerkError.message;
          }
        }
      } else if (err?.message) {
        // Fallback for generic JavaScript errors
        if (err.message.length < 100) {
          // Use generic error message if concise
          userMessage = err.message;
        }
      }

      showToast(userMessage);
      // Consider if signUp.reload() is always necessary or if it should be conditional
      // For example, you might not want to reload if it's just a format validation error.
      if (
        userMessage.includes("Account not found") ||
        userMessage.includes("unexpected error")
      ) {
        signUp.reload(); // Reload only for more critical errors perhaps
      }
    }
  };

  const handleEmailSignIn = async () => {
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "password",
        password: state.password,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        router.push("/home");
      } else {
        // Handle incomplete sign-in (multi-factor auth required, etc.)
        showToast("Sign in requires additional verification");
      }
    } catch (err) {
      console.error("Password sign-in failed:", err);

      // Handle specific error cases
      let errorMessage = "Sign in failed. Please try again.";

      if (err.errors && err.errors.length > 0) {
        // Clerk-specific errors
        const clerkError = err.errors[0];
        errorMessage =
          clerkError.longMessage || clerkError.message || errorMessage;
      } else if (err.message) {
        // General error messages
        if (
          err.message.includes("password") ||
          err.message.includes("credentials")
        ) {
          errorMessage = "Incorrect email or password";
        } else if (err.message.includes("network")) {
          errorMessage = "Network error. Please check your connection";
        }
      }

      showToast(errorMessage);
    }
  };

  const handlePhoneSignIn = async (fullCode) => {
    const code = fullCode || state.phoneCode;
    console.info({ code });

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "phone_code",
        code,
      });

      console.log("Clerk result:", result); // Add this log

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        router.push("/home");
        return { success: true, status: "complete" }; // ✅ Add this return
      } else {
        return {
          success: false,
          status: result.status,
          message: "Verification incomplete",
        };
      }
    } catch (err) {
      console.error("Phone verification failed:", err);

      let errorMessage = "Phone verification failed";
      if (err.errors && err.errors.length > 0) {
        const clerkError = err.errors[0];
        if (clerkError.code === "form_code_incorrect") {
          errorMessage = "Invalid verification code";
        } else if (clerkError.code === "form_code_expired") {
          errorMessage = "Verification code has expired";
        } else {
          errorMessage =
            clerkError.longMessage || clerkError.message || errorMessage;
        }
      }

      showToast(errorMessage);
      return { success: false, error: errorMessage }; // ✅ Add this return
    }
  };
  const handleOAuthPhoneVerification = async () => {
    try {
      await state.oauthSignUp.update({ phoneNumber: state.phoneNumber });
      await state.oauthSignUp.preparePhoneNumberVerification();
      updateState("status", "confirmOAuthPhone");
    } catch (error) {
      console.error("Phone verification error:", error);
      showToast("Failed to verify phone number");
    }
  };

  const confirmOAuthPhone = async (fullCode) => {
    const code = fullCode || state.phoneCode;

    try {
      console.info({ confirmOAuthPhone: code });

      const result = await state.oauthSignUp.attemptPhoneNumberVerification({
        code,
      });

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId });
        resetState();
        router.push("/home");
      }
      // updateState("status", "handleOAuthPhoneVerification");
    } catch (error) {
      // updateState("status", "handleOAuthPhoneVerification");
      console.error("Phone confirmation failed:", error);
      showToast("Invalid verification code");
    }
  };

  const sendEmailPasswordResetCode = async () => {
    try {
      const result = await signIn.create({
        strategy: "reset_password_email_code",
        identifier: state.emailAddress,
      });

      showToast("Password reset code sent to your email 📧", false); // false indicates success
      updateState("status", "confirmEmailPasswordResetCode");
    } catch (err) {
      console.error("Password reset failed:", err);

      let errorMessage = "Couldn't send reset code. Please try again.";

      // Handle Clerk-specific errors
      if (err.errors && err.errors.length > 0) {
        const clerkError = err.errors[0];

        switch (clerkError.code) {
          case "form_identifier_not_found":
            errorMessage = "No account found with this email address";
            break;
          case "form_param_format_invalid":
            errorMessage = "Please enter a valid email address";
            break;
          case "rate_limit_exceeded":
            errorMessage = "Too many attempts. Please wait before trying again";
            break;
          default:
            errorMessage =
              clerkError.longMessage || clerkError.message || errorMessage;
        }
      }
      // Handle general error cases
      else if (err.message) {
        if (err.message.includes("network")) {
          errorMessage = "Network error. Please check your connection";
        } else if (err.message.includes("email")) {
          errorMessage = "Invalid email format";
        }
      }

      showToast(errorMessage);

      // For development only
      if (__DEV__) {
        console.log("Full error details:", {
          error: err,
          emailAttempted: state.emailAddress,
        });
      }
    }
  };

  const confirmEmailPasswordResetCode = async (code) => {
    const fullCode = code || state.resetPasswordCode;

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        password: state.password,
        code: fullCode,
      });

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId });
        router.push("/home");
        showToast("Password reset successful! You're now signed in.");
      } else {
        showToast("Please complete the password reset process");
      }
    } catch (err) {
      console.error("Password reset failed:", err);

      let errorMessage = "Password reset failed. Please try again.";

      if (err.errors && err.errors.length > 0) {
        // Handle Clerk-specific errors
        const clerkError = err.errors[0];
        errorMessage =
          clerkError.longMessage || clerkError.message || errorMessage;

        // Specific cases for password reset
        if (clerkError.code === "form_code_incorrect") {
          errorMessage =
            "Incorrect verification code. Please check your email.";
        } else if (clerkError.code === "form_password_pwned") {
          errorMessage =
            "This password has been compromised. Please choose a different one.";
        }
      } else if (err.message) {
        // Handle general error messages
        if (err.message.includes("code") || err.message.includes("expired")) {
          errorMessage = "The verification code is invalid or expired.";
        } else if (err.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else if (err.message.includes("password")) {
          errorMessage = "Invalid password. It must meet the requirements.";
        }
      }

      showToast(errorMessage);

      // For development/debugging (remove in production)
      if (__DEV__) {
        console.log("Full error object:", err);
      }
    }
  };

  const showToast = (msg) => {
    toast.show(msg, {
      type: "warning",
      placement: "bottom",
      duration: 4000,
      offset: 30,
      animationType: "slide-in",
    });
    // if (Platform.OS === "android") {
    //   ToastAndroid.show(msg, ToastAndroid.SHORT);
    // } else {
    //   toast.show(msg);
    // }
  };
  return (
    <AuthContext.Provider
      value={{
        state,
        updateState,
        signUpWithEmail,
        confirmEmail,
        connectPhoneToAccount,
        confirmPhone,
        checkIdentifier,
        sendEmailPasswordResetCode,
        handlePhoneSignIn,
        resetState,
        handleOAuthPhoneVerification,
        confirmOAuthPhone,
        sendEmailPasswordResetCode,
        confirmEmailPasswordResetCode,
        handleEmailSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
3;
