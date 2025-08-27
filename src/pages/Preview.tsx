import PreviewForm from "../preview/PreviewForm";

export default function Preview() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="text-sm text-slate-500">Live Preview</div>
      </div>
      <div className="mx-auto max-w-2xl">
        <div className="bg-white rounded-xl border p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <h2 className="text-lg font-semibold mb-1">Generated Form</h2>
          <p className="text-sm text-slate-500 mb-6">This form is rendered from your schema</p>
          <PreviewForm />
        </div>
      </div>
    </div>
  );
}
