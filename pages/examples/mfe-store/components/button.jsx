import register from "preact-custom-element";
import "./button.css";

const Button = ({
  href,
  type,
  value,
  disabled = false,
  rounded = false,
  className = "",
  children,
  dataId,
  variant = "secondary",
}) => {
  const Tag = href ? "a" : "button";

  const classNames = ["e_Button", `e_Button--${variant}`, className, rounded ? "e_Button--rounded" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag
      disabled={href ? undefined : disabled}
      href={href || undefined}
      type={href ? undefined : type}
      value={value || undefined}
      data-id={dataId || undefined}
      class={classNames}
    >
      <div class="e_Button__inner">
        <slot>{children}</slot>
      </div>
    </Tag>
  );
};

// Register as a Custom Element: <ds-button>
register(Button, "ds-button", ["href", "type", "value", "disabled", "rounded", "className", "dataId", "variant"]);

export default Button;
