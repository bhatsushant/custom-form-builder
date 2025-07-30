// pages/form/[id].tsx
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import FormRenderer from "../../components/FormRenderer/FormRenderer";

export default function FormPage() {
  const router = useRouter();
  const { id } = router.query;

  if (!id || typeof id !== "string") {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold text-red-600">Form not found</h1>
          <p className="text-gray-600 mt-2">
            The form you're looking for doesn't exist.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <FormRenderer formId={id} />
    </Layout>
  );
}
