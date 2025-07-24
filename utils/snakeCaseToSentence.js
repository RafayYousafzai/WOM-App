export default function snakeCaseToSentence(str) {
  if (!str || typeof str !== "string") return str;

  // Replace underscores with spaces
  let sentence = str.replace(/_/g, " ");

  // Capitalize the first letter of each word
  sentence = sentence.replace(/\b\w/g, (char) => char.toUpperCase());

  return sentence;
}
