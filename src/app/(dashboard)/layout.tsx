import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col md:pl-64">
        <Header />
        <main className="flex-1 bg-[#FAFAFA] p-4 md:p-8">{children}</main>
      </div>
    </div>
  )
}
