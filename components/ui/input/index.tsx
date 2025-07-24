import React, {
  forwardRef,
  useContext,
  createContext,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Platform,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
  runOnJS,
} from "react-native-reanimated";

const { width: screenWidth } = Dimensions.get("window");

const InputContext = createContext<{
  variant?: "filled" | "outlined" | "underlined" | "floating" | "rounded";
  size?: "sm" | "md" | "lg" | "xl";
  isInvalid?: boolean;
  isFocused?: boolean;
  hasValue?: boolean;
}>({});

// Enhanced color palette
const colors = {
  primary: "#3B82F6",
  primaryLight: "#60A5FA",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  white: "#FFFFFF",
  black: "#000000",
};

// Enhanced Input Component
type InputProps = {
  variant?: "filled" | "outlined" | "underlined" | "floating" | "rounded";
  size?: "sm" | "md" | "lg" | "xl";
  isDisabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  label?: string;
  helperText?: string;
  errorText?: string;
  successText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
  children?: React.ReactNode;
};

const Input = forwardRef<View, InputProps>(
  (
    {
      variant = "outlined",
      size = "md",
      isDisabled = false,
      isInvalid = false,
      isRequired = false,
      label,
      helperText,
      errorText,
      successText,
      leftIcon,
      rightIcon,
      onFocus,
      onBlur,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(false);

    // Animation values
    const focusAnimation = useSharedValue(0);
    const scaleAnimation = useSharedValue(1);
    const labelAnimation = useSharedValue(0);
    const borderAnimation = useSharedValue(0);
    const shadowAnimation = useSharedValue(0);

    // Size configurations
    const sizeConfig = {
      sm: { height: 40, fontSize: 14, paddingHorizontal: 12, borderRadius: 8 },
      md: { height: 44, fontSize: 16, paddingHorizontal: 16, borderRadius: 10 },
      lg: { height: 56, fontSize: 18, paddingHorizontal: 20, borderRadius: 12 },
      xl: { height: 64, fontSize: 20, paddingHorizontal: 24, borderRadius: 14 },
    };

    const currentSize = sizeConfig[size];

    // Get border radius based on variant
    const getBorderRadius = () => {
      if (variant === "rounded") {
        return currentSize.height / 2; // Full rounded (pill shape)
      }
      return currentSize.borderRadius;
    };

    const handleFocus = () => {
      setIsFocused(true);
      focusAnimation.value = withSpring(1, { damping: 15, stiffness: 150 });
      scaleAnimation.value = withSpring(1.02, { damping: 15, stiffness: 200 });
      labelAnimation.value = withTiming(1, { duration: 200 });
      borderAnimation.value = withTiming(1, { duration: 200 });
      shadowAnimation.value = withTiming(1, { duration: 200 });
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      focusAnimation.value = withSpring(0, { damping: 15, stiffness: 150 });
      scaleAnimation.value = withSpring(1, { damping: 15, stiffness: 200 });
      if (!hasValue && variant === "floating") {
        labelAnimation.value = withTiming(0, { duration: 200 });
      }
      borderAnimation.value = withTiming(0, { duration: 200 });
      shadowAnimation.value = withTiming(0, { duration: 200 });
      onBlur?.();
    };

    // Container animated style
    const containerAnimatedStyle = useAnimatedStyle(() => {
      const backgroundColor = interpolateColor(
        focusAnimation.value,
        [0, 1],
        [
          variant === "filled" || variant === "rounded"
            ? colors.gray[50]
            : colors.white,
          variant === "filled" || variant === "rounded"
            ? colors.white
            : colors.white,
        ]
      );

      const borderColor = interpolateColor(
        borderAnimation.value,
        [0, 1],
        [
          isInvalid ? colors.error : colors.gray[300],
          isInvalid ? colors.error : colors.primary,
        ]
      );

      return {
        backgroundColor,
        borderColor,
        borderWidth: variant === "underlined" ? 0 : 2,
        borderBottomWidth: variant === "underlined" ? 2 : 2,
        transform: [{ scale: scaleAnimation.value }],
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: shadowAnimation.value * 0.1,
        shadowRadius: shadowAnimation.value * 8,
        elevation: shadowAnimation.value * 4,
      };
    });

    // Label animated style for floating variant
    const labelAnimatedStyle = useAnimatedStyle(() => {
      if (variant !== "floating") return {};

      return {
        transform: [
          {
            translateY: labelAnimation.value * -24,
          },
          {
            scale: 1 - labelAnimation.value * 0.2,
          },
        ],
      };
    });

    // Get helper text to display
    const getHelperText = () => {
      if (isInvalid && errorText)
        return { text: errorText, color: colors.error };
      if (!isInvalid && successText)
        return { text: successText, color: colors.success };
      if (helperText) return { text: helperText, color: colors.gray[600] };
      return null;
    };

    const helperTextInfo = getHelperText();

    return (
      <InputContext.Provider
        value={{ variant, size, isInvalid, isFocused, hasValue }}
      >
        <View style={[{ marginBottom: 4 }, style]}>
          {/* Label for non-floating variants */}
          {label && variant !== "floating" && (
            <Text
              style={{
                fontSize: currentSize.fontSize - 2,
                fontWeight: "600",
                color: isFocused ? colors.primary : colors.gray[700],
                marginBottom: 8,
              }}
            >
              {label}
              {isRequired && <Text style={{ color: colors.error }}> *</Text>}
            </Text>
          )}

          {/* Input Container */}
          <Animated.View
            ref={ref}
            style={[
              {
                height: currentSize.height,
                borderRadius: getBorderRadius(),
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal:
                  variant === "rounded"
                    ? currentSize.paddingHorizontal + 4
                    : currentSize.paddingHorizontal,
                position: "relative",
                overflow: "hidden",
              },
              containerAnimatedStyle,
            ]}
            {...props}
          >
            {/* Floating label */}
            {label && variant === "floating" && (
              <Animated.Text
                style={[
                  {
                    position: "absolute",
                    left: currentSize.paddingHorizontal + (leftIcon ? 32 : 0),
                    fontSize: currentSize.fontSize,
                    color: isFocused ? colors.primary : colors.gray[500],
                    fontWeight: "500",
                    zIndex: 1,
                  },
                  labelAnimatedStyle,
                ]}
              >
                {label}
                {isRequired && <Text style={{ color: colors.error }}> *</Text>}
              </Animated.Text>
            )}

            {/* Left Icon */}
            {leftIcon && (
              <View style={{ marginRight: 12, opacity: isDisabled ? 0.5 : 1 }}>
                {leftIcon}
              </View>
            )}

            {/* Input Field or Children */}
            <View style={{ flex: 1 }}>{children}</View>

            {/* Right Icon */}
            {rightIcon && (
              <View style={{ marginLeft: 12, opacity: isDisabled ? 0.5 : 1 }}>
                {rightIcon}
              </View>
            )}

            {/* Focus indicator line for underlined variant */}
            {variant === "underlined" && (
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    backgroundColor: isInvalid ? colors.error : colors.primary,
                    transform: [{ scaleX: focusAnimation.value }],
                  },
                ]}
              />
            )}
          </Animated.View>

          {/* Helper Text */}
          {helperTextInfo && (
            <Text
              style={{
                fontSize: currentSize.fontSize - 4,
                color: helperTextInfo.color,
                marginTop: 6,
                marginLeft: 4,
              }}
            >
              {helperTextInfo.text}
            </Text>
          )}
        </View>
      </InputContext.Provider>
    );
  }
);

// Enhanced InputField Component
type InputFieldProps = {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  secureTextEntry?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: any;
  autoCapitalize?: any;
  autoCorrect?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: any;
};

const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      placeholder,
      value,
      onChangeText,
      secureTextEntry = false,
      editable = true,
      multiline = false,
      numberOfLines = 1,
      onFocus,
      onBlur,
      style,
      ...props
    },
    ref
  ) => {
    const { variant, size, isInvalid, isFocused } = useContext(InputContext);
    const inputRef = useRef<TextInput>(null);

    // Size configurations
    const sizeConfig = {
      sm: { fontSize: 14 },
      md: { fontSize: 15 },
      lg: { fontSize: 18 },
      xl: { fontSize: 20 },
    };

    const currentSize = sizeConfig[size || "md"];

    const handleFocus = () => {
      onFocus?.();
    };

    const handleBlur = () => {
      onBlur?.();
    };

    const handleChangeText = (text: string) => {
      onChangeText?.(text);
    };

    return (
      <TextInput
        ref={ref || inputRef}
        value={value}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={variant === "floating" && isFocused ? "" : placeholder}
        placeholderTextColor={colors.gray[400]}
        secureTextEntry={secureTextEntry}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        className="placeholder:font-thin placeholder:text-gray-400 placeholder:text-sm"
        style={[
          {
            flex: 1,
            fontSize: currentSize.fontSize,
            color: colors.gray[900],
            fontWeight: "500",
            paddingVertical: 0,
            textAlignVertical: multiline ? "top" : "center",
          },
          Platform.OS === "web" && { outline: "none" },
          style,
        ]}
        {...props}
      />
    );
  }
);

// Icon wrapper component
const InputIcon = ({
  children,
  size = 20,
  color,
}: {
  children: React.ReactNode;
  size?: number;
  color?: string;
}) => {
  const { isFocused, isInvalid } = useContext(InputContext);

  const iconColor = isInvalid
    ? colors.error
    : isFocused
    ? colors.primary
    : color || colors.gray[500];

  return (
    <View style={{ width: size, height: size }}>
      {React.cloneElement(children as React.ReactElement, {
        size,
        color: iconColor,
      })}
    </View>
  );
};

// Action button component (for things like show/hide password)
const InputAction = ({
  onPress,
  children,
}: {
  onPress: () => void;
  children: React.ReactNode;
}) => {
  const scaleAnimation = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnimation.value }],
  }));

  const handlePressIn = () => {
    scaleAnimation.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scaleAnimation.value = withSpring(1);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
};

Input.displayName = "Input";
InputField.displayName = "InputField";
InputIcon.displayName = "InputIcon";
InputAction.displayName = "InputAction";

export { Input, InputField, InputIcon, InputAction };

// Example usage with the new rounded variant:
/*
import { Search, User, Mail, Lock } from 'lucide-react-native';

// Rounded variant - perfect for search bars
<Input
  variant="rounded"
  size="lg"
  leftIcon={<InputIcon><Search /></InputIcon>}
  helperText="Search for anything..."
>
  <InputField
    value={searchQuery}
    placeholder="Search..."
    onChangeText={setSearchQuery}
  />
</Input>

// Rounded variant with user icon
<Input
  variant="rounded"
  size="md"
  label="Username"
  leftIcon={<InputIcon><User /></InputIcon>}
>
  <InputField
    value={username}
    placeholder="Enter username"
    onChangeText={setUsername}
  />
</Input>

// All variants comparison:
<Input variant="outlined" label="Outlined" />
<Input variant="filled" label="Filled" />
<Input variant="underlined" label="Underlined" />
<Input variant="floating" label="Floating" />
<Input variant="rounded" label="Rounded (New!)" />
*/
