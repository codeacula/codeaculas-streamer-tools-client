function isNullOrWhitespace(input: string | null | undefined): input is null | undefined | '' {
  return !input || input.trim().length === 0;
}

function useValidation() {
  return {
    isNullOrWhitespace,
  };
}

export default useValidation;
