
export const stripSanitizedParts = (input) => {
    return input.replace(/<[^>]*>/g, '');
};

