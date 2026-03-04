import { useEffect, useMemo, useState } from "react";
import styles from "../components/BookingPage.module.css";

function formatDa(iso) {
  return new Date(iso).toLocaleString("da-DK", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function todayISODate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BookingPage() {
  const [barbers, setBarbers] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);

  const [barberId, setBarberId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayISODate());
  const [slot, setSlot] = useState("");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [msg, setMsg] = useState("");

  const selectedService = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  // Load barbers + services on mount
  useEffect(() => {
    (async () => {
      const [b, s] = await Promise.all([
        fetch("/api/barbers").then((r) => r.json()),
        fetch("/api/services").then((r) => r.json()),
      ]);

      if (b?.ok) {
        setBarbers(b.barbers);
        if (b.barbers?.[0]) setBarberId(b.barbers[0].id);
      }
      if (s?.ok) {
        setServices(s.services);
        if (s.services?.[0]) setServiceId(s.services[0].id);
      }
    })();
  }, []);

  // Load available slots when barber/date changes
  useEffect(() => {
    if (!barberId || !date) return;

    (async () => {
      setLoadingSlots(true);
      setSlot("");
      setMsg("");

      const r = await fetch(`/api/availability?date=${date}&barberId=${barberId}`);
      const data = await r.json().catch(() => null);

      if (data?.ok) setSlots(data.slots);
      else setSlots([]);

      setLoadingSlots(false);
    })();
  }, [barberId, date]);

  async function submitBooking(e) {
    e.preventDefault();
    setMsg("");

    if (!barberId || !serviceId || !slot || !name.trim()) {
      setMsg("Udfyld venligst: frisør, service, tid og navn.");
      return;
    }

    setBooking(true);

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        barberId,
        serviceId,
        startISO: slot,
        customerName: name.trim(),
        customerPhone: phone.trim(),
      }),
    });

    const data = await res.json().catch(() => null);

    if (res.ok && data?.ok) {
      setMsg("✅ Booking oprettet! Du får en bekræftelse (vi kontakter dig hvis noget ændrer sig).");
      setPhone("");
      setName("");
      // refresh slots so the booked slot disappears
      const r2 = await fetch(`/api/availability?date=${date}&barberId=${barberId}`);
      const d2 = await r2.json().catch(() => null);
      if (d2?.ok) setSlots(d2.slots);
      setSlot("");
    } else {
      setMsg(data?.error || "Noget gik galt. Prøv igen.");
    }

    setBooking(false);
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <p className={styles.kicker}>SHORTCUT · GAMMEL KONGEVEJ 91C</p>
        <h1 className={styles.title}>Book en tid</h1>
        <p className={styles.sub}>
          Vælg frisør, service og tid — så får vi din booking med det samme.
        </p>
      </header>

      <main className={styles.shell}>
        <form className={styles.card} onSubmit={submitBooking}>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span>Frisør</span>
              <select value={barberId} onChange={(e) => setBarberId(e.target.value)}>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span>Service</span>
              <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {s.price} kr
                  </option>
                ))}
              </select>
              {selectedService && (
                <small className={styles.hint}>
                  Varighed ca. {selectedService.durationMin} min
                </small>
              )}
            </label>

            <label className={styles.field}>
              <span>Dato</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>

            <label className={styles.field}>
              <span>Tid</span>
              <select value={slot} onChange={(e) => setSlot(e.target.value)} disabled={loadingSlots}>
                <option value="">
                  {loadingSlots ? "Henter tider..." : "Vælg tid"}
                </option>
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {formatDa(s)}
                  </option>
                ))}
              </select>
              {!loadingSlots && slots.length === 0 && (
                <small className={styles.hint}>Ingen ledige tider denne dag.</small>
              )}
            </label>

            <label className={styles.field}>
              <span>Navn</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Dit navn" />
            </label>

            <label className={styles.field}>
              <span>Telefon</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Valgfrit"
              />
            </label>
          </div>

          <button className={styles.button} type="submit" disabled={booking}>
            {booking ? "Booker..." : "Book tid"}
          </button>

          {msg && <p className={styles.msg}>{msg}</p>}
        </form>

        <aside className={styles.side}>
          <div className={styles.sideCard}>
            <h3>Åbningstider</h3>
            <p>Man–Fre: 10–18</p>
            <p>Lør: 10–16</p>
            <p>Søn: Lukket</p>
          </div>

          <div className={styles.sideCard}>
            <h3>Adresse</h3>
            <p>Gammel Kongevej 91C</p>
            <p>Frederiksberg</p>
          </div>
        </aside>
      </main>
    </div>
  );
}