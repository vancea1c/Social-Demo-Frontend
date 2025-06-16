import React, { Fragment } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { MoreHorizontal } from "react-feather";
interface PostMenuProps {
  type: string;
  onDelete: () => void;

}

const PostMenu: React.FC<PostMenuProps> = ({
  type,
  onDelete,
}) => {
  return (
    <Menu as="div" className="relative inline-block text-left z-10">
      <MenuButton
        className="p-1 hover:bg-gray-200 rounded-full"
        onClick={(e) => {
          e.preventDefault(); // opțional
          e.stopPropagation();
        }}
      >
        <MoreHorizontal size={18} />
      </MenuButton>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <MenuItems className="absolute right-0 mt-2 w-40 origin-top-right rounded-xl bg-white dark:bg-gray-900 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete();
                  }}
                  className={`${
                    active ? "bg-red-100 dark:bg-red-800" : ""
                  } text-red-600 dark:text-red-300 group flex rounded-md items-center w-full px-4 py-2 text-sm`}
                >
                  {type === "reply" ? "Delete Comment" : "Delete Post"}
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export default PostMenu;
