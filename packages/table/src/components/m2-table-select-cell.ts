import { SelectColumnConfig, SelectOption } from '../interfaces'
import { TemplateResult, customElement, html } from 'lit-element'

import { AbstractM2TableCell } from '../abstracts/abstract-m2-table-cell'

@customElement('m2-table-select-cell')
export class M2TableSelectCell extends AbstractM2TableCell<HTMLSelectElement> {
  editorAccessor: string = 'select'

  renderEditor(config: SelectColumnConfig): TemplateResult {
    const { options }: SelectColumnConfig = config

    return html`
      <select>
        <option></option>
        ${((options as any) || []).map(
          (option: string | SelectOption): TemplateResult => {
            if (typeof option === 'string') {
              return html`<option ?selected="${option === this.value}">${option}</option>`
            } else {
              option = option as SelectOption
              return html`<option value="${option.value}" ?selected="${option.value === this.value}">
                ${option.display}
              </option>`
            }
          }
        )}
      </select>
    `
  }

  renderDisplay(config: SelectColumnConfig): TemplateResult {
    const { options, displayValue }: SelectColumnConfig = config

    if (displayValue && typeof displayValue === 'string') {
      return this.displayCellFactory(displayValue)
    } else if (displayValue && typeof displayValue === 'function') {
      return this.displayCellFactory(displayValue(this.value))
    }

    if (!options?.length) {
      return this.displayCellFactory('')
    }

    const selectedOption: string | SelectOption = (options as any).find((option: string | SelectOption) => {
      if (typeof option === 'string') {
        return option === this.value
      } else {
        return option.value === this.value
      }
    })

    if (selectedOption) {
      const displayValue: string = typeof selectedOption === 'string' ? selectedOption : selectedOption.display
      return this.displayCellFactory(displayValue)
    } else {
      return this.displayCellFactory('')
    }
  }

  focusOnEditor(): void {
    this.editor?.focus()
  }

  checkValidity(): boolean {
    return this.editor?.checkValidity()
  }
}
