import { toast } from "react-toastify";
import "../css/styles.css";
const showToastConfirmation = (action,option, callback,attention) => {
    toast(
      <div style={{ textAlign: "center" }}>
        <p>Are you sure you want to {action} this {option}? <strong>{attention}</strong></p>
        <div>
          <button
            className="btn btn-danger btn-sm mr-2"
            onClick={() => {
              callback();
              toast.dismiss();
            }}
          >
            Yes
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => toast.dismiss()}
          >
            No
          </button>
        </div>
      </div>,
      { position: "top-center", autoClose: false}
    );
  };

  export default showToastConfirmation;