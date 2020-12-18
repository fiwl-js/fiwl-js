import ParamsTemplate from "../ParamsTemplate";

export default interface ClipboardInterface {
    /**
     *  Reads the current clipboard text and returns the text
     *
     *  @param {void} Nothing
     *  @returns {Promise<String>} Text
     */
    read: () => Promise<String>;

    /**
     *  Add a new item to local storage
     *
     *  @param {string} Data The data to write
     *  @returns {Promise<void>} Nothing
     */
    write: (data: string) => Promise<void>;
}

export const name = "clipboard";

export const bind = async (
    params: ParamsTemplate
): Promise<ClipboardInterface> => {
    const clipboard: ClipboardInterface = {
        read: () => {
            return navigator.clipboard.readText();
        },
        write: (data: string) => {
            return navigator.clipboard.writeText(data)
        }
    }
    return Object.freeze(clipboard)
}