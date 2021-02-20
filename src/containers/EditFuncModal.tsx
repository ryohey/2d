import React, { FC, FormEvent, useState } from "react"
import Modal from "react-modal"
import { useAppDispatch } from "../hooks"
import { updateNode } from "../stores/GraphStore"
import { IFuncNode } from "../types"

export type ModalInput = Pick<IFuncNode, "id" | "name" | "code" | "isAsync">

export interface EditFuncModalProps {
  closeModal: () => void
  node: IFuncNode
}

export const EditFuncModal: FC<EditFuncModalProps> = ({ closeModal, node }) => {
  const [modalInput, setModalInput] = useState<ModalInput>(node)
  const dispatch = useAppDispatch()

  const onClickModalOK = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    closeModal()
    dispatch(
      updateNode({
        id: modalInput.id,
        updater: (b) => ({
          ...b,
          name: modalInput.name,
          code: modalInput.code,
          isAsync: modalInput.isAsync,
        }),
      })
    )
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
            onChange={(e) =>
              setModalInput({
                ...modalInput,
                name: e.target.value,
              })
            }
          />
        </div>
        <div className="section">
          <label>code</label>
          <textarea
            value={modalInput.code}
            onChange={(e) =>
              setModalInput({
                ...modalInput,
                code: e.target.value,
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
              onChange={(e) =>
                setModalInput({
                  ...modalInput,
                  isAsync: e.target.checked,
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
