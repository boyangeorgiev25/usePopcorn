const contanerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
};

const starStyle = {
  display: "Flex",
  gap: "4px",
  justifyContent: "center",
  fontSize: "2rem",
  color: "#FFD700",
  cursor: "pointer",
};

const textStyle = {
  fontSize: "1.5rem",
  color: "#333",
  marginTop: "10px",
};

export default function StarRating({ max = 5 }) {
  return (
    <div className="star-rating">
      {Array.from({ length: max }, (_, index) => (
        <span
          role="button"
          aria-label={`${index + 1} star${index + 1 > 1 ? "s" : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
}
