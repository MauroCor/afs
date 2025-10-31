import React, { useEffect } from 'react';

const Modal = ({
  title = '',
  children,
  footer = null,
  onClose,
  contentClassName = '',
  primaryText,
  onPrimary,
  primaryClassName = 'flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200',
  primaryDisabled = false,
  secondaryText,
  onSecondary,
  secondaryClassName = 'flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition duration-200',
  secondaryDisabled = false,
  actionsAlign = 'space-x-3',
}) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full ${contentClassName}`}>
        <div className="p-6">
          {title ? (
            <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>
          ) : null}
          <div>{children}</div>
          {footer ? (
            <div className="mt-6">{footer}</div>
          ) : (primaryText || secondaryText) ? (
            <div className={`mt-6 flex ${actionsAlign}`}>
              {secondaryText ? (
                <button type="button" onClick={onSecondary} disabled={secondaryDisabled} className={`${secondaryClassName} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {secondaryText}
                </button>
              ) : null}
              {primaryText ? (
                <button onClick={onPrimary} disabled={primaryDisabled} className={`${primaryClassName} disabled:opacity-50 disabled:cursor-not-allowed`}>
                  {primaryText}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Modal;


