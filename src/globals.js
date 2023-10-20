export const getElementHeight = (selector) => {
    const element = document.querySelector(selector);
    if (element) {
        return `${element.clientHeight}px`;
    }
    return 0; // Return 0 if the element is not found
};
