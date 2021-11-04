import React, { useRef } from 'react';
import DialogContext, { dialogContextState } from './DialogContext';
import { DialogComponent } from './types';

interface dialogStateItem {
  component: DialogComponent<unknown, unknown>;
  isOpen: boolean;
  data?: unknown;
  resolve?: (value: unknown) => void;
}

const DialogProvider: React.FC = ({ children }) => {
  const [dialogs, setDialogs] = React.useState<{ [key: string]: dialogStateItem }>({});
  const id = useRef(0);

  const ctx: dialogContextState = {
    /**
     * Registers a new dialog component and returns the assigned id of that dialog
     * @param component The component to use
     * @returns the id of the dialog
     */
    register: function (component: DialogComponent<unknown, unknown>): string {
      const dialog: dialogStateItem = {
        component,
        isOpen: false,
      };
      setDialogs((d) => ({ ...d, [id.current]: dialog }));
      return String(id.current++);
    },

    /**
     * Removes a registerd dialog given its id
     * @param dialogId the id of the dialog
     */
    unregister: function (dialogId: string): void {
      setDialogs(({ [dialogId]: _, ...d }) => d);
    },
    /**
     * Show the dialog with the given id, and optionally pass in some data. If the dialog is already open, this will just update the data
     * @param dialogId the id of the dialog
     * @param data data to pass to the dialog component
     */
    show: function (dialogId: string, data: unknown): Promise<unknown> {
      return new Promise((resolve) => {
        setDialogs((d) => ({ ...d, [dialogId]: { ...d[dialogId], data, isOpen: true, resolve } }));
      });
    },
    /**
     * Force closes the dialog with the given id
     * @param dialogId the id of the dialog
     */
    hide: function (dialogId: string): void {
      setDialogs((d) => ({ ...d, [dialogId]: { ...d[dialogId], isOpen: false } }));
    },
  };

  console.log(dialogs)

  return (
    <>
      <DialogContext.Provider value={ctx}>
        {children}
        {Object.entries(dialogs).map(([id, { component: C, isOpen, data, resolve }]) => {
          if (resolve) {
            const onClose = (value: unknown) => {
              ctx.hide(id);
              resolve(value);
            };
            return <C key={id} open={isOpen} handleClose={onClose} data={data} />;
          } else {
            return; 
          }
        })}
      </DialogContext.Provider>
    </>
  );
};

export default DialogProvider;