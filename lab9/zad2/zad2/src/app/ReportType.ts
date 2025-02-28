export type ReportTypeElementItem = { id: number, nazwa: string, checked: boolean }
export type ReportTypeElement = { category: string, items: ReportTypeElementItem[] }
export type ReportType = ReportTypeElement[]