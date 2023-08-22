function modalFunc(options) {
  let elemModal;
  let eventShowModal;
  let eventHideModal;
  let hiding = false;
  let destroyed = false;
  const animationSpeed = 200;

  function createModal(option) {
    elemModal = document.createElement('div');
    /* eslint-disable */
    let modalTemplate =
      '<div class="modal__backdrop" data-dismiss="modalFunc"><div class="modal__content"><div class="modal__header"><div class="modal__title" data-modalFunc="title">{{title}}</div><span class="modal__btn-close" data-dismiss="modalFunc" title="Закрыть">×</span></div><div class="modal__body" data-modalFunc="content">{{content}}</div>{{footer}}</div></div>';
    let modalFooterTemplate = '<div class="modal__footer">{{buttons}}</div>';
    /* eslint-disable */
    let modalButtonTemplate =
      '<button type="button" class="{{button_class}}" data-handler={{button_handler}}>{{button_text}}</button>';
    let modalHTML;
    let modalFooterHTML = "";

    elemModal.classList.add("modalFunc");
    modalHTML = modalTemplate.replace(
      "{{title}}",
      option.title || "Новое окно"
    );
    modalHTML = modalHTML.replace("{{content}}", option.content || "");
    if (option.footerButtons) {
      for (let i = 0, length = option.footerButtons.length; i < length; i++) {
        /* eslint-disable */
        let modalFooterButton = modalButtonTemplate.replace(
          "{{button_class}}",
          option.footerButtons[i].class
        );
        /* eslint-disable */
        modalFooterButton = modalFooterButton.replace(
          "{{button_handler}}",
          option.footerButtons[i].handler
        );
        /* eslint-disable */
        modalFooterButton = modalFooterButton.replace(
          "{{button_text}}",
          option.footerButtons[i].text
        );
        modalFooterHTML += modalFooterButton;
      }
      modalFooterHTML = modalFooterTemplate.replace(
        "{{buttons}}",
        modalFooterHTML
      );
    }
    modalHTML = modalHTML.replace("{{footer}}", modalFooterHTML);
    elemModal.innerHTML = modalHTML;
    document.body.appendChild(elemModal);
    return elemModal;
  }

  function showModal() {
    if (!destroyed && !hiding) {
      elemModal.classList.add("modal__show");
      document.dispatchEvent(eventShowModal);
    }
  }

  function hideModal() {
    hiding = true;
    elemModal.classList.remove("modal__show");
    elemModal.classList.add("modal__hiding");
    setTimeout(function () {
      elemModal.classList.remove("modal__hiding");
      hiding = false;
    }, animationSpeed);
    document.dispatchEvent(eventHideModal);
  }

  function handlerCloseModal(e) {
    if (e.target.dataset.dismiss === "modalFunc") {
      hideModal();
    }
  }

  elemModal = createModal(options || {});

  elemModal.addEventListener("click", handlerCloseModal);
  eventShowModal = new CustomEvent("show.modalFunc", { detail: elemModal });
  eventHideModal = new CustomEvent("hide.modalFunc", { detail: elemModal });

  return {
    show: showModal,
    hide: hideModal,
    destroy: function () {
      elemModal.parentElement.removeChild(elemModal);
      elemModal.removeEventListener("click", handlerCloseModal);
      destroyed = true;
    },
    setContent: function (html) {
      elemModal.querySelector('[data-modalFunc="content"]').innerHTML = html;
    },
    setTitle: function (text) {
      elemModal.querySelector('[data-modalFunc="title"]').innerHTML = text;
    },
  };
}

export default function showModal(message, unicode) {
  const modal = modalFunc({
    title: message,
    content: "&#" + unicode,
    footerButtons: [
      {
        class: "btn btn__cancel",
        text: "Close",
        handler: "modalHandlerCancel",
      },
    ],
  });
  document.addEventListener("click", (e) => {
    if (e.target.dataset.handler === "modalHandlerCancel") modal.hide();
  });
  modal.show();
}
