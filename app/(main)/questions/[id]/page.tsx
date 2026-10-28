import QuestionDetail from "@/components/questions/QuestionDetail";
export default async function Page({ params }: { params: Promise<{ id: string }> }) { return <QuestionDetail id={(await params).id} />; }
