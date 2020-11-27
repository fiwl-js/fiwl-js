import ParamsTemplate from "../ParamsTemplate";

/** Handle localStorage, cookies and other in-browser storage methods and events */
export default interface StorageInterface {
    /**
     *  Add a new item to local storage
     *
     *  @param {string} key The reference key for the item
     *  @param {string} value The referenced value of the item
     *  @returns {void} Nothing
     */
    add: (key: string, value: string) => void;

    /**
     *  Delete an item from local storage
     *
     *  @param {string} key The reference identifier key of the item to be deleted
     *  @returns {void} Nothing
     */
    delete: (key: string) => void;
}

export const name = "storage";

export const bind = async (
    params: ParamsTemplate
): Promise<StorageInterface> => {
    const storage: StorageInterface = {
        add: (key: string, value: string) => {
            localStorage.setItem(key, value);
        },
        delete: (key: string) => {
            localStorage.removeItem(key);
        }
    }
    return Object.freeze(storage)
}