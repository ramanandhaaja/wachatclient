import React, { useState, useEffect, ReactNode } from "react";

interface MenuItem {
  label: string;
  onClick: (e: React.MouseEvent) => void;
  icon?: ReactNode;
}

interface ContextMenuProps {
  children: ReactNode;
  menuItems: MenuItem[];
}

interface ContextMenuProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  isVisible: boolean;
  onClose: () => void;
  position: { x: number; y: number } | null;
  onContextMenu: (e: React.MouseEvent) => void;
}

const RightClickMenu: React.FC<ContextMenuProps> = ({
  children,
  menuItems,
  isVisible,
  onClose,
  position,
  onContextMenu,
}) => {
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isVisible) {
        onClose();
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isVisible, onClose]);

  return (
    <div onContextMenu={onContextMenu} className="relative">
      {children}
      {isVisible && position && (
        <div
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg z-50"
          style={{ top: position.y, left: position.x }}
        >
          <ul className="py-2">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm flex items-center gap-2"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  item.onClick(e);
                  onClose();
                }}
              >
                {item.icon && <span>{item.icon}</span>}
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RightClickMenu;
