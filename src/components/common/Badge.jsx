import { getStatusBadgeColor, cn } from '@utils/helpers';

function Badge({ children, variant, status, className, ...props }) {
  const getVariantClass = () => {
    if (status) return getStatusBadgeColor(status);

    const variants = {
      primary: 'bg-primary-100 text-primary-800',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      danger: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return variants[variant] || variants.gray;
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        getVariantClass(),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
