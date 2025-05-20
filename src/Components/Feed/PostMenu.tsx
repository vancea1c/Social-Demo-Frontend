import React, { useState, Fragment } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Transition,
} from "@headlessui/react";
import { MoreHorizontal } from "react-feather";
interface PostMenuProps {
  isMe: boolean;
  onDelete: () => void;
  onAddFriend: () => void;
  onBlock: () => void;
}

const PostMenu: React.FC<PostMenuProps> = ({
  isMe,
  onDelete,
  onAddFriend,
  onBlock,
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
            {isMe ? (
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
                    Delete Post
                  </button>
                )}
              </MenuItem>
            ) : (
              <>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={onAddFriend}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } text-gray-900 dark:text-gray-200 group flex rounded-md items-center w-full px-4 py-2 text-sm`}
                    >
                      Add friend
                    </button>
                  )}
                </MenuItem>
                <MenuItem>
                  {({ active }) => (
                    <button
                      onClick={onBlock}
                      className={`${
                        active ? "bg-gray-100 dark:bg-gray-700" : ""
                      } text-gray-900 dark:text-gray-200 group flex rounded-md items-center w-full px-4 py-2 text-sm`}
                    >
                      Block
                    </button>
                  )}
                </MenuItem>
              </>
            )}
          </div>
        </MenuItems>
      </Transition>
    </Menu>
  );
};

export default PostMenu;
