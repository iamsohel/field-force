import { cn } from '@utils/helpers';

function Card({ children, className, title, subtitle, action, ...props }) {
  return (
    <div className={cn('card p-4', className)} {...props}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-3">
          <div>
            {title && <h3 className="text-base font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export default Card;
