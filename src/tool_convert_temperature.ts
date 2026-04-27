import { ParameterType, tool } from '@optimizely-opal/opal-tools-sdk';
import { z } from "zod";

const ConvertTempSchema = z.object({
  temperature: z.number(),
  unit: z.string()
})

type ConvertTempParams = z.infer<typeof ConvertTempSchema>;

export class TemperatureTools {
  @tool({
    name: 'convert_temperature',
    description: 'Converts temperatures from one unit to another',
    parameters: [
      {
        name: 'temperature',
        type: ParameterType.Number,
        description: 'The original temperature which is going to be converted',
        required: true,
      }, {
        name: 'unit',
        type: ParameterType.String,
        description: "The unit of the input temperature ('C' for Celsius, 'F' for Fahrenheit).",
        required: true,
      }
    ],
  })
  async convertTemperature(params: ConvertTempParams) {
    const result = ConvertTempSchema.safeParse(params)
    if (!result.success) {
      return {
        status: 400,
        error: z.treeifyError(result.error),
      };
    }
    const {temperature, unit} = result.data
    switch (unit.toUpperCase()) {
      case "C":
        return (temperature * 9/5) + 32
      case "F":
        return 5*(temperature - 32) / 9
      default:
        return {
          status: 400,
          error: "Expected input property 'unit' to be 'C' or 'F', instead received " + unit
        }
    }
  }
}