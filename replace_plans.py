from pathlib import Path
path = Path("src/app/booking-details/page.tsx")
text = path.read_text(encoding="utf-8")
start = text.index("                    {selectedTripId === trip.id && selectedClass === 'economy'")
start_business = text.index("                    {selectedTripId === trip.id && selectedClass === 'business'", start)
closing = "                    )}"
end_pos = text.index(closing, start_business)
end = end_pos + len(closing)
while end < len(text) and text[end] in "\r\n":
    end += 1
replacement = "                    {selectedTripId === trip.id && selectedClass === 'economy' && renderPlanCards('economy', planVariants.economy, trip, index)}\n\n                    {selectedTripId === trip.id && selectedClass === 'business' && renderPlanCards('business', planVariants.business, trip, index)}\n"
new_text = text[:start] + replacement + text[end:]
path.write_text(new_text, encoding="utf-8")
