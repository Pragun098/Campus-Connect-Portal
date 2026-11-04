import { Link } from "react-router-dom";

function PortalCard({ title, description, icon, className, to }) {
  return (
    <Link className="role-card" to={to}>

      <span className={`role-icon ${className}`}>
        {icon}
      </span>

      <span>
        <strong>{title}</strong>
        <small>{description}</small>
      </span>

      <b>→</b>

    </Link>
  );
}

export default PortalCard;