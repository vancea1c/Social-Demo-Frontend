// src/Components/Feed/RepostMenu.tsx
import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Repeat } from "react-feather"; // retweet icon
import { PostProps } from "./Post2";
import { useToggleRepost } from "../useToggleRepost";
interface RepostMenuProps {
  post: PostProps;
  onQuote: () => void;
  hideIfReply?: boolean;
}
const RepostMenu: React.FC<RepostMenuProps> = ({
  post,
  onQuote,
  hideIfReply = false,
}) => {
  if (hideIfReply) return null;
  const { reposted, count, toggle } = useToggleRepost(post);

  const handleToggle = async () => {
    try {
      await toggle();
      // nu facem setState local aici
    } catch (err) {
      console.error(err);
    } finally {
    }
  };
  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Always render one button, then only show count if count > 0 */}
      <Menu.Button className="p-1 hover:bg-gray-200 rounded-full flex items-center">
        <Repeat
          size={20}
          className={reposted ? "text-green-600" : "text-gray-600"}
        />
        {count > 0 && (
          <span className="ml-1 text-sm font-medium text-gray-800">
            {count}
          </span>
        )}
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className="
        absolute right-0 mt-2 w-36
        bg-white divide-y divide-gray-100
        rounded-md shadow-md ring-1 ring-black ring-opacity-5
        focus:outline-none z-[900]
      "
        >
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleToggle}
                  className={`${
                    active ? "bg-gray-100" : ""
                  } flex items-center w-full px-4 py-2 text-sm font-medium text-gray-800`}
                >
                  <Repeat size={16} className="mr-2" />
                  {reposted ? "Undo repost" : "Repost"}
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={onQuote}
                  className={`${
                    active ? "bg-gray-100" : ""
                  } flex items-center w-full px-4 py-2 text-sm font-medium text-gray-800`}
                >
                  Quote
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
export default RepostMenu;
