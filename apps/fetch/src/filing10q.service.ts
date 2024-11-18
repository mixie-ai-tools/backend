// filing10q.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class Filing10QService {
  // Mapping of 10-Q section codes to detailed prompts with consistent fields
  private sectionPrompts: { [sectionCode: string]: string } = {
    // Part 1
    part1item1: `
      Provide a detailed summary of the "Financial Statements" section.
      Include insights into key financial metrics, identified trends, and any significant anomalies or changes noted.
      Cover details about revenue, profit margins, asset management, and other relevant financial highlights.
    `,

    part1item2: `
      Summarize the "Management’s Discussion and Analysis" section.
      Include information on the company’s financial condition, results of operations, and any forward-looking statements.
      Highlight revenue trends, cost control measures, and management’s expectations for future performance.
    `,

    part1item3: `
      Summarize the "Quantitative and Qualitative Disclosures About Market Risk" section.
      Include details on market risks, such as interest rate risk, currency fluctuations, and commodity price exposure.
      Discuss any risk mitigation strategies the company uses to manage these market risks.
    `,

    part1item4: `
      Provide an overview of the "Controls and Procedures" section, focusing on internal controls over financial reporting.
      Highlight the effectiveness of these controls, any identified deficiencies, and updates or corrective actions taken.
    `,

    // Part 2
    part2item1: `
      Summarize the "Legal Proceedings" section.
      Describe any significant ongoing or potential legal actions involving the company, including regulatory actions and potential impacts.
    `,

    part2item1a: `
      Provide a summary of the "Risk Factors" section.
      Outline the main operational, financial, or market-related risks identified by the company.
      Highlight any new risks or changes to previously disclosed risks.
    `,

    part2item2: `
      Summarize the "Unregistered Sales of Equity Securities and Use of Proceeds" section.
      Include details of recent unregistered sales of securities, the amount of proceeds raised, and how the proceeds were used.
    `,

    part2item3: `
      Summarize the "Defaults Upon Senior Securities" section.
      Describe any defaults or arrearages on senior securities, reasons for these issues, and actions taken by the company to address them.
    `,

    part2item4: `
      Provide an overview of the "Mine Safety Disclosures" section.
      Include any mine safety violations, citations, orders, or regulatory actions the company faced, along with compliance measures.
    `,

    part2item5: `
      Summarize the "Other Information" section.
      Highlight any significant events or additional information disclosed that might impact the company’s financials or operations.
    `,

    part2item6: `
      Provide a summary of the "Exhibits" section.
      List any important exhibits included with the filing, such as contracts, agreements, or other supporting documents that provide context for the company’s activities.
    `,
  };

  /**
   * Returns the prompt associated with a specific 10-Q section.
   * @param sectionCode - The shorthand code for the 10-Q section.
   * @returns The prompt for the specified section, or a default message if not found.
   */
  getPromptForSection(sectionCode: string): string {
    return (
      this.sectionPrompts[sectionCode] ||
      `Prompt for section "${sectionCode}" is not defined.`
    );
  }
}
