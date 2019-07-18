import React, { FormEvent, SFC, useState } from "react"
import Modal from "react-modal"
import { BlockStore } from "../stores/BlockStore"
import { IBlock } from "../types"

export type ModalInput = Pick<IBlock, "id" | "name" | "code" | "isAsync">

export interface EditBlockModalProps {
  closeModal: () => void
  blockStore: BlockStore
  block: IBlock
}

export const EditBlockModal: SFC<EditBlockModalProps> = ({
  closeModal,
  blockStore,
  block
}) => {
  const [modalInput, setModalInput] = useState<ModalInput>(block)

  const onClickModalOK = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    closeModal()
    blockStore.updateBlock(modalInput.id, b => ({
      ...b,
      name: modalInput.name,
      code: modalInput.code,
      isAsync: modalInput.isAsync
    }))
  }

  return (
    <Modal
      contentLabel="edit block"
      isOpen={true}
      onRequestClose={closeModal}
      overlayClassName="BlockModalOverlay"
      className="BlockModal"
    >
      <form onSubmit={onClickModalOK}>
        <div className="section">
          <label>name</label>
          <input
            type="text"
            value={modalInput.name}
            onChange={e =>
              setModalInput({
                ...modalInput,
                name: e.target.value
              })
            }
          />
        </div>
        <div className="section">
          <label>code</label>
          <textarea
            value={modalInput.code}
            onChange={e =>
              setModalInput({
                ...modalInput,
                code: e.target.value
              })
            }
          />
        </div>
        <div className="section">
          <label>async</label>
          <div>
            <input
              type="checkbox"
              checked={modalInput.isAsync}
              onChange={e =>
                setModalInput({
                  ...modalInput,
                  isAsync: e.target.checked
                })
              }
            />
          </div>
        </div>
        <div className="section footer">
          <button type="button" className="button" onClick={closeModal}>
            Cancel
          </button>
          <button type="submit" className="button primary">
            OK
          </button>
        </div>
      </form>
    </Modal>
  )
}
