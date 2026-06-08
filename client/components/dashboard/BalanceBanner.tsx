import { Card, CardContent } from "../ui/card"

export const BalanceBanner = ()=>{
return (
    <Card className="mb-4 border-0" style={{ backgroundColor: "#1D9E75" }}>
        <CardContent className="p-5">
          <p
            className="text-xs mb-1"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Total balance
          </p>
          <p className="text-3xl font-medium text-white mb-4">€2,840.50</p>
          <div className="flex gap-6">
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                March income
              </p>
              <p className="text-base font-medium text-white">+€3,200.00</p>
            </div>
            <div>
              <p
                className="text-xs mb-1"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                March expenses
              </p>
              <p className="text-base font-medium" style={{ color: "#9FE1CB" }}>
                -€359.50
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
)
}