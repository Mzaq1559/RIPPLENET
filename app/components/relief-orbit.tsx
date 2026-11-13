"use client";

export default function ReliefOrbit() {
  return (
    <div className="relief-orbit">
      <span className="relief-orbit__ring relief-orbit__ring--wide" />
      <span className="relief-orbit__ring relief-orbit__ring--tilted" />
      <span className="relief-orbit__ring relief-orbit__ring--vertical" />
      <span className="relief-orbit__core" />
    </div>
  );
}
