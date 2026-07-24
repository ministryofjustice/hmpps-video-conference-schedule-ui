import { registerDecorator, ValidationOptions } from 'class-validator'
import { isWeekend } from 'date-fns'

export default function IsWeekDay(validationOptions: ValidationOptions) {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      name: 'IsValidDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate: dateToValidate => isWeekend(dateToValidate) === false,
      },
    })
  }
}
