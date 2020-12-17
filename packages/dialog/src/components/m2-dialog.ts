import {
  CSSResult,
  LitElement,
  TemplateResult,
  css,
  customElement,
  html,
  property,
} from 'lit-element'

import { Dialog } from '../interfaces/dialog-state'
import { closeDialog } from '../redux'
import { connect } from 'pwa-helpers/connect-mixin'
import { store } from '@m2fw/redux-manager'

@customElement('m2-dialog')
export class M2Dialog extends connect(store)(LitElement) {
  @property({ type: Array }) private dialogs: Dialog[] = []
  @property({ type: Boolean, reflect: true }) removeBackdrop: boolean = false

  private draggingDialog?: HTMLDivElement
  private clickX?: number
  private clickY?: number

  static get styles(): CSSResult[] {
    return [
      css`
        :host > #modal {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          background-color: var(
            --m2-modal-background-color,
            rgba(0, 0, 0, 0.3)
          );
          z-index: 9;
        }
        :host([removeBackdrop]) > #modal {
          width: 0;
          height: 0;
        }
        .dialog {
          display: flex;
          flex-direction: column;
          position: absolute;
          border: none;
          border-radius: none;
          background-color: transparent;
          width: var(--m2-dialog-width, 60vw);
          height: var(--m2-dialog-height, 40vh);
          left: calc((100vw - var(--m2-dialog-width, 60vw)) / 2);
          top: calc((100vh - var(--m2-dialog-height, 40vh)) / 2);
          resize: var(--m2-dialog-resize, both);
          overflow: auto;
          z-index: 10;
          min-height: var(--m2-dialog-min-height, 200px);
          min-width: var(--m2-dialog-min-width, 200px);
          max-height: 100vh;
          max-width: 100vw;
        }
        #popup-header {
          cursor: move;
          background-color: transparent;
        }
      `,
    ]
  }

  render(): TemplateResult {
    const dialogs: Dialog[] = this.dialogs || []
    window.onmouseout = this.clearDragHandler.bind(this)

    return html`
      ${dialogs?.length
        ? html`
            <div id="modal" @mouseup="${this.clearDragHandler.bind(this)}">
              ${dialogs.map((dialog: Dialog) => {
                const dialogId: string | undefined = dialog.id
                if (!dialogId) throw new Error('Dialog ID is not defined')

                return html`
                  <div
                    id="${dialogId}"
                    class="dialog"
                    @click="${(e: MouseEvent) =>
                      this.reorderStack(e.currentTarget as HTMLDivElement)}"
                  >
                    <div
                      id="popup-header"
                      @mousedown="${this.onmousedownHandler.bind(this)}"
                    >
                      ${dialog.template.header}
                    </div>
                    ${dialog.template.content}
                  </div>
                `
              })}
            </div>
          `
        : html``}
    `
  }

  get modal(): HTMLDivElement {
    const modal: HTMLDivElement | null = this.renderRoot.querySelector('#modal')
    if (!modal) throw new Error('Failed to find modal')
    return modal
  }

  onmousedownHandler(e: MouseEvent) {
    this.draggingDialog = (e.currentTarget as HTMLDivElement)
      .parentElement as HTMLDivElement
    this.reorderStack(this.draggingDialog)
    this.clickX = e.pageX
    this.clickY = e.pageY
    this.onmousemove = this.onmousemoveHandler.bind(this)
  }

  clearDragHandler(e: MouseEvent) {
    this.onmousemove = null
    this.draggingDialog = undefined
    this.clickX = undefined
    this.clickY = undefined
  }

  onmousemoveHandler(e: MouseEvent) {
    const currentX: number = e.pageX
    const currentY: number = e.pageY

    if (this.clickX === undefined || this.clickY === undefined) {
      throw new Error('The position values when header clicked is missing')
    }

    const diffX = this.clickX - currentX
    const diffY = this.clickY - currentY

    if (!this.draggingDialog) throw new Error('dialog is not selected yet')

    this.draggingDialog.style.left = this.calcPositionLeft(
      this.draggingDialog,
      diffX
    )
    this.draggingDialog.style.top = this.calcPositionTop(
      this.draggingDialog,
      diffY
    )

    this.clickX = currentX
    this.clickY = currentY
  }

  calcPositionLeft(element: HTMLDivElement, diff: number): string {
    const currentLeft: number = element.offsetLeft
    const left: number = currentLeft + diff * -1
    const rightEnd: number = left + element.clientWidth

    if (left <= 0) {
      return '0px'
    } else if (window.innerWidth <= rightEnd) {
      return `${window.innerWidth - element.clientWidth}px`
    } else {
      console.log(left)
      return `${left}px`
    }
  }

  calcPositionTop(element: HTMLDivElement, diff: number): string {
    const currentTop: number = element.offsetHeight
    const top: number = currentTop + diff * -1
    const bottomEnd: number = top + element.clientHeight

    if (top <= 0) {
      return '0px'
    } else if (window.innerHeight <= bottomEnd) {
      return `${window.innerHeight - element.clientHeight}px`
    } else {
      return `${top}px`
    }
  }

  reorderStack(dialog: HTMLDivElement): void {
    const baseLayer: number = 10

    let dialogs: HTMLDivElement[] = Array.from(
      this.renderRoot.querySelectorAll('div.dialog')
    ) as HTMLDivElement[]
    const topLayer: number = baseLayer + dialogs.length - 1

    dialogs = dialogs
      .filter((d: HTMLDivElement) => d.id !== dialog.id)
      .sort((a: HTMLDivElement, b: HTMLDivElement) => {
        const aZIndex: number = Number(a.style.zIndex)
        const bZIndex: number = Number(b.style.zIndex)

        if (aZIndex > bZIndex) return -1
        if (aZIndex < bZIndex) return 1
        return 0
      })
    dialogs.forEach(
      (d: HTMLDivElement, idx: number) =>
        (d.style.zIndex = String(topLayer - 1 - idx))
    )
    dialog.style.zIndex = String(topLayer)
  }

  stateChanged(state: any) {
    this.dialogs = state.dialog?.dialogs || this.dialogs
    this.requestUpdate()
  }
}
