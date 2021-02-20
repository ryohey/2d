import React, { FC } from "react"
import Modal from "react-modal"

const HelpContent = () => (
  <div>
    <h1>Help</h1>
    <dl>
      <dt>Create blocks</dt>
      <dd>Double-click on the stage.</dd>
      <dt>Edit blocks</dt>
      <dd>Double-click on the block. Edit the code.</dd>
      <dt>Remove blocks</dt>
      <dd>Click the downward arrow on the block. Select remove.</dd>
      <dt>Run</dt>
      <dd>
        Click the play button. The graph will be evaluated as JavaScript. You
        should add the output block that runs alert() or console.log() to see
        the result.
      </dd>
    </dl>
  </div>
)

export interface HelpModalProps {
  isOpen: boolean
  close: () => void
}

export const HelpModal: FC<HelpModalProps> = ({ isOpen, close }) => (
  <Modal
    contentLabel="help"
    isOpen={isOpen}
    onRequestClose={close}
    overlayClassName="HelpModalOverlay"
    className="HelpModal"
  >
    <HelpContent />
  </Modal>
)
