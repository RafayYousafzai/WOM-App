export const sendPushNotification = async (userData, title, body) => {
  if (!userData?.trustedContacts || userData.trustedContacts.length === 0) {
    console.warn(
      "No Trusted Contacts",
      "Please add trusted contacts below to send an emergency alert."
    );
    return;
  }

  const expoPushTokens = userData.trustedContacts
    .map((contact) => contact.expoPushToken)
    .filter((token) => token);

  if (expoPushTokens.length === 0) {
    console.warn(
      "No Valid Tokens",
      "None of your contacts have a valid push notification token. Please ensure your contacts have the app installed."
    );
    return;
  }

  try {
    const payload = {
      to: expoPushTokens,
      title: title,
      body: body,
    };

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send alert. Status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error sending alert:", error);
  }
};
