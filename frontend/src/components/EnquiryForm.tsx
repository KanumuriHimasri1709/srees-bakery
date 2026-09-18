import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Send } from "lucide-react";
import { toast } from "sonner";
import { ImageUpload } from "./ImageUpload";
import {
  submitOrderEnquiry,
  submitCustomCakeEnquiry,
  uploadCustomReference,
} from "../services/api";

interface EnquiryFormProps {
  custom?: boolean;
  initialReference?: string;
}

export function EnquiryForm({
  custom = false,
  initialReference,
}: EnquiryFormProps) {
  const [step, setStep] = useState(1);
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [referencePreview, setReferencePreview] = useState<string | null>(
    initialReference || null
  );
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Record<string, string>>({
    name: "",
    phone: "",
    requiredDate: "",
    eggPreference: "",
    product: "",
    quantity: "",
    occasion: "",
    flavour: "",
    size: "",
    theme: "",
    colour: "",
    sweetness: "",
    messageOnCake: "",
    deliveryRequired: "No",
    customization: "",
    additionalMessage: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (custom && !formData.occasion && !formData.flavour) {
        toast.error("Please enter the occasion or preferred flavour.");
        return;
      }
      if (!custom && !formData.product) {
        toast.error("Please enter the product or cake you wish to order.");
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error("Please provide your name and phone number.");
      return;
    }

    setSubmitting(true);
    try {
      let uploadedUrl: string | undefined = undefined;

      // If customer attached a local file, upload it to the backend first
      if (referenceFile) {
        const uploadResult = await uploadCustomReference(referenceFile);
        uploadedUrl = uploadResult.url;
      } else if (referencePreview && !referencePreview.startsWith("blob:")) {
        uploadedUrl = referencePreview;
      }

      if (custom) {
        await submitCustomCakeEnquiry({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          requiredDate: formData.requiredDate || undefined,
          eggPreference: formData.eggPreference || undefined,
          occasion: formData.occasion || undefined,
          flavour: formData.flavour || undefined,
          size: formData.size || undefined,
          theme: formData.theme || undefined,
          colour: formData.colour || undefined,
          sweetness: formData.sweetness || undefined,
          messageOnCake: formData.messageOnCake || undefined,
          additionalMessage: formData.additionalMessage || undefined,
          referenceImageUrl: uploadedUrl,
        });
      } else {
        await submitOrderEnquiry({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          product: formData.product || undefined,
          quantity: formData.quantity || undefined,
          requiredDate: formData.requiredDate || undefined,
          eggPreference: formData.eggPreference || undefined,
          customization: formData.customization || undefined,
          deliveryRequired: formData.deliveryRequired || undefined,
          additionalMessage: formData.additionalMessage || undefined,
        });
      }

      toast.success(
        "Your enquiry has been received! Sree’s Home Bakery will contact you for confirmation."
      );
      // Reset form
      setStep(1);
      setReferenceFile(null);
      setReferencePreview(null);
      setFormData({
        name: "",
        phone: "",
        requiredDate: "",
        eggPreference: "",
        product: "",
        quantity: "",
        occasion: "",
        flavour: "",
        size: "",
        theme: "",
        colour: "",
        sweetness: "",
        messageOnCake: "",
        deliveryRequired: "No",
        customization: "",
        additionalMessage: "",
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to submit enquiry. Please call us.");
    } finally {
      setSubmitting(false);
    }
  };

  const labels = custom
    ? ["Details", "Design & Preferences", "Reference Photo", "Customer Info"]
    : ["Item Selection", "Date & Delivery", "Design Reference", "Customer Info"];

  return (
    <form className="form-card enquiry-wizard" onSubmit={handleSubmit}>
      <div className="wizard-steps">
        {labels.map((label, index) => (
          <span
            className={
              step === index + 1
                ? "wizard-step active"
                : step > index + 1
                ? "wizard-step complete"
                : "wizard-step"
            }
            key={label}
          >
            <b>{step > index + 1 ? <Check size={12} /> : index + 1}</b>
            {label}
          </span>
        ))}
      </div>

      {step === 1 && (
        <div className="form-grid">
          {custom ? (
            <>
              <Field label="Occasion" name="occasion">
                <input
                  id="occasion"
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleInputChange}
                  placeholder="e.g. 1st Birthday, Anniversary, Graduation"
                />
              </Field>
              <Field label="Preferred Flavour" name="flavour">
                <input
                  id="flavour"
                  name="flavour"
                  value={formData.flavour}
                  onChange={handleInputChange}
                  placeholder="e.g. Chocolate, Vanilla, Red Velvet, Rasmalai"
                />
              </Field>
              <Field label="Approximate Size" name="size">
                <input
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  placeholder="e.g. ½ kg, 1 kg, 2 kg"
                />
              </Field>
              <Field label="Required Date" name="requiredDate">
                <input
                  id="requiredDate"
                  name="requiredDate"
                  type="date"
                  value={formData.requiredDate}
                  onChange={handleInputChange}
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Product / Cake Name" name="product">
                <input
                  id="product"
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  placeholder="e.g. Chocolate Cake, Brownies (Pack of 6), Kunafa"
                />
              </Field>
              <Field label="Quantity / Weight" name="quantity">
                <input
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="e.g. 1 kg, 12 pcs, 250 g"
                />
              </Field>
            </>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="form-grid">
          <Field label="Required Date" name="requiredDate">
            <input
              id="requiredDate"
              name="requiredDate"
              type="date"
              value={formData.requiredDate}
              onChange={handleInputChange}
            />
          </Field>
          <Field label="Egg / Eggless Preference" name="eggPreference">
            <select
              id="eggPreference"
              name="eggPreference"
              value={formData.eggPreference}
              onChange={handleInputChange}
            >
              <option value="">Select preference</option>
              <option value="Egg">Egg</option>
              <option value="Eggless">Eggless</option>
              <option value="Need confirmation">Need confirmation with bakery</option>
            </select>
          </Field>

          {custom ? (
            <>
              <Field label="Theme / Design Details" name="theme" full>
                <textarea
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleInputChange}
                  placeholder="Describe your desired theme, shapes, cartoon characters, florals, etc."
                />
              </Field>
              <Field label="Color Palette" name="colour">
                <input
                  id="colour"
                  name="colour"
                  value={formData.colour}
                  onChange={handleInputChange}
                  placeholder="e.g. Pastel pink and white, Navy blue and gold"
                />
              </Field>
              <Field label="Sweetness Preference" name="sweetness">
                <select
                  id="sweetness"
                  name="sweetness"
                  value={formData.sweetness}
                  onChange={handleInputChange}
                >
                  <option value="">Select sweetness</option>
                  <option value="Regular">Regular sweetness</option>
                  <option value="Less sweet">Mild / Less sweet</option>
                </select>
              </Field>
              <Field label="Message to Write on Cake" name="messageOnCake" full>
                <input
                  id="messageOnCake"
                  name="messageOnCake"
                  value={formData.messageOnCake}
                  onChange={handleInputChange}
                  placeholder="e.g. Happy Birthday Aanya!"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Delivery Required?" name="deliveryRequired">
                <select
                  id="deliveryRequired"
                  name="deliveryRequired"
                  value={formData.deliveryRequired}
                  onChange={handleInputChange}
                >
                  <option value="No">No (Self Pickup)</option>
                  <option value="Yes">Yes (Rapido delivery - charges paid by customer)</option>
                </select>
              </Field>
              <Field label="Special Customization Requests" name="customization" full>
                <textarea
                  id="customization"
                  name="customization"
                  value={formData.customization}
                  onChange={handleInputChange}
                  placeholder="Any eggless requests, specific packaging or instructions."
                />
              </Field>
            </>
          )}
        </div>
      )}

      {step === 3 && (
        <div>
          <p className="wizard-intro">
            Have a design in mind? Add an optional reference image to help Sree’s Home Bakery craft your cake.
          </p>
          <ImageUpload
            value={referencePreview || undefined}
            onChange={(url) => {
              setReferencePreview(url);
            }}
          />
        </div>
      )}

      {step === 4 && (
        <div className="form-grid">
          <Field label="Your Full Name" name="name">
            <input
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. Priya Rao"
            />
          </Field>
          <Field label="Phone Number" name="phone">
            <input
              id="phone"
              name="phone"
              required
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="10-digit mobile number"
            />
          </Field>
          <Field label="Additional Message" name="additionalMessage" full>
            <textarea
              id="additionalMessage"
              name="additionalMessage"
              value={formData.additionalMessage}
              onChange={handleInputChange}
              placeholder="Any additional requests or dietary notes."
            />
          </Field>

          <p className="form-note full">
            <b>Note:</b> Cake orders should be placed 1 day before. Sree’s Home Bakery will call you to confirm your order and pricing.
          </p>
        </div>
      )}

      <div className="wizard-actions">
        {step > 1 && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => setStep(step - 1)}
            disabled={submitting}
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <span className="form-note">Step {step} of 4</span>
        {step < 4 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleNext}
          >
            Continue <ArrowRight size={14} />
          </button>
        ) : (
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting…" : "Send Enquiry"} <Send size={14} />
          </button>
        )}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  children,
  full = false,
}: {
  label: string;
  name: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={full ? "field full" : "field"}>
      <label htmlFor={name}>{label}</label>
      {children}
    </div>
  );
}
