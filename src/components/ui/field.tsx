import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'
import { inputClassName } from './inputClasses'

export const Field = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('flex flex-col gap-1.5', className)} {...props} />
)

export const FieldLabel = ({ className, ...props }: LabelHTMLAttributes<HTMLSpanElement>) => (
  <span className={cn('text-[0.85rem] font-medium text-ink', className)} {...props} />
)

export const FieldInput = ({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cn(inputClassName, className)} {...props} />
)

export const FieldSelect = ({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(inputClassName, className)} {...props} />
)

export const FieldTextarea = ({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={cn(inputClassName, className)} {...props} />
)
