import { useContext } from "react";
import styles from "./SettingsModal.module.css";
import { SettingsContext } from "../../contexts/SettingsContext";

export default function SettingsModal({
  activeModal,
  closeModal,
}: {
  activeModal: string;
  closeModal: () => void;
}) {
  const { showHand, toggleShowHand, zoomedIn, toggleZoomedIn } =
    useContext(SettingsContext);

  return (
    <div
      className={`${styles.settings_modal} ${
        activeModal === "settings" && styles.active
      }`}
    >
      <div className={styles.settings_modal_content}>
        <header className={styles.settings_header}>
          <div className={styles.buttons}>
            <div
              onClick={() => {
                closeModal();
              }}
              className={`${styles.button} ${styles.red}`}
            />
            <div className={`${styles.button} ${styles.yellow}`} />
            <div className={`${styles.button} ${styles.green}`} />
          </div>
          <h2 className={styles.header_title}>Settings</h2>
        </header>
        <section className={styles.main}>
          <div className={styles.main_options}>
            <div className={styles.option}>
              <h2 className={styles.option_name}>
                Show Yeti Hands
                <p className={styles.option_description}>
                  {showHand ? 'Removes' : 'Display'} the yeti hands.
                </p>
              </h2>
              <label className={styles.switch}>
                <input
                  onChange={toggleShowHand}
                  className={styles.input}
                  checked={showHand}
                  type="checkbox"
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            <div className={styles.option}>
              <h2 className={styles.option_name}>
                Zoom into iPod Screen
                <p className={styles.option_description}>
                  Brings you closer to the iPod screen, allows touch / click
                  controls on the screen instead of using the scrollwheel.
                </p>
              </h2>
              <label className={styles.switch}>
                <input
                  onChange={toggleZoomedIn}
                  className={styles.input}
                  checked={zoomedIn}
                  type="checkbox"
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
