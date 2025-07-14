import { useSelector } from "react-redux";

const SuccessPopup = ({ setShowSuccessPopup }) => {
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const styles = {
    successPopupOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 1000,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    successPopupContainer: {
      width: "400px",
      backgroundColor: currentTheme.popupBg,
      borderRadius: "20px",
      padding: "50px",
      textAlign: "center",
      color: currentTheme.textColor,
      border: `1px solid ${currentTheme.borderColor}`,
    },
    successMessage: {
      fontSize: "22px",
      marginBottom: "25px",
    },
    successButton: {
      background: "linear-gradient(135deg, #CBFEFF, #6ABCFF)",
      color: "#000",
      border: "none",
      borderRadius: "5px",
      padding: "10px 20px",
      cursor: "pointer",
      fontSize: "16px",
      minWidth: "150px",
    },
  };

  return (
    <div style={styles.successPopupOverlay}>
      <div style={styles.successPopupContainer}>
        <img
          className="max-w-20 mx-auto mb-5"
          src="/images/success-animated-icon.gif"
          alt="Success"
        />
        <div style={styles.successMessage}>
          The new group has been <br />
          created successfully!
        </div>
        <button
          style={styles.successButton}
          onClick={() => setShowSuccessPopup(false)}
        >
          Great
        </button>
      </div>
    </div>
  );
};

export default SuccessPopup;
