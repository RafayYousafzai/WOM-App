import React, { useRef } from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { OtpInput } from "react-native-otp-entry";

interface VerificationCodeInputProps {
  length?: number;
  onVerify: (code: string) => void;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  length = 6,
  onVerify,
}) => {
  const otpInputRef = useRef<any>(null);

  return (
    <View>
      <OtpInput
        ref={otpInputRef}
        numberOfDigits={length}
        focusColor="#f39f1e"
        placeholder="-"
        autoFocus={true}
        onTextChange={(text) => {
          if (text.length === length) {
            onVerify(text);
          }
        }}
        theme={{
          containerStyle: { 
            justifyContent: 'center',
            marginBottom: 32
          },
          pinCodeContainerStyle: {
            borderWidth: 1,
            borderColor: '#D1D5DB',
            borderRadius: 12,
            width: 56,
            height: 56,
            backgroundColor: 'white',
          },
          pinCodeTextStyle: {
            fontSize: 24,
          },
          placeholderTextStyle: {
            color: 'grey',
          },
          focusedPinCodeContainerStyle: {
            borderColor: '#f39f1e',
          },
        }}
        type="numeric"
      />
      
      <TouchableOpacity
        className="flex-row items-center justify-center p-4 rounded-full bg-[#f39f1e]"
        onPress={() => {
          if (otpInputRef.current) {
            // Try to get the code using a method or property exposed by OtpInput
            const currentCode = otpInputRef.current.getValue
              ? otpInputRef.current.getValue()
              : otpInputRef.current.props?.value || "";
            if (currentCode.length === length) {
              onVerify(currentCode);
            } else {
              onVerify(currentCode);
            }
          }
        }}
      >
        <Text className="text-white text-xl font-medium">Verify</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VerificationCodeInput;