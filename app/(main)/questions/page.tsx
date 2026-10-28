import QuestionList from "@/components/questions/QuestionList";
export default async function Page({ searchParams }: { searchParams: Promise<{ tag?: string }> }) { const { tag } = await searchParams; return <QuestionList key={tag ?? ""} tag={tag ?? ""} />; }
