import { customElement, html, property, TemplateResult } from 'lit-element'
import { AbstractM2TableCell } from '../abstracts/AbstractM2TableCell'
import {
  SelectColumnConfigInterface,
  SelectOptionInterface,
} from '../interfaces'

@customElement('m2-table-object-cell')
export class M2TableObjectCell extends AbstractM2TableCell {
  @property({ type: Object }) config?: SelectColumnConfigInterface

  render(): TemplateResult {
    if (!this.config?.options)
      throw new Error('Options should be defined for object column')

    return html`
      ${this._isEditing
        ? html`
            <select>
              <option></option>
              ${((this.config?.options as any) || []).map(
                (option: string | SelectOptionInterface): TemplateResult => {
                  if (typeof option === 'string') {
                    return html`<option ?selected="${option === this.value}"
                      >${option}</option
                    >`
                  } else {
                    option = option as SelectOptionInterface
                    return html`<option
                      value="${option.value}"
                      ?selected="${option.value === this.value}"
                      >${option.display}</option
                    >`
                  }
                }
              )}
            </select>
          `
        : html`${this.displayValue}`}
    `
  }

  get editor(): HTMLSelectElement | null {
    return this.renderRoot?.querySelector('select')
  }

  focusOnEditor(): void {
    this.editor?.focus()
  }
}