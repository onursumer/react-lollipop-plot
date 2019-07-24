import {getTextWidth, longestCommonStartingSubstring} from "cbioportal-frontend-commons";

import {LollipopSpec} from "../model/LollipopSpec";
import {Mutation} from "../model/Mutation";
import {countMutationsByProteinChange} from "./MutationUtils";

export function lollipopLabelText(mutationsAtPosition: Mutation[], size?: number): string {
    const mutationCountsByProteinChange = countMutationsByProteinChange(mutationsAtPosition)
        .filter(c => c.proteinChange !== undefined);

    // only pick specified number of protein change values
    const proteinChanges = mutationCountsByProteinChange
        .map(m => m.proteinChange)
        .slice(0, size && size > 0 ? size : undefined);

    // sort alphabetically (to make it easier to find longest common starting substring)
    const proteinChangesSorted = proteinChanges.slice(0).sort();

    let startStr = "";
    if (proteinChangesSorted.length > 1) {
        // only need to compare first and last element of sorted string list to find longest common starting substring of all of them
        startStr = longestCommonStartingSubstring(
            proteinChangesSorted[0], proteinChangesSorted[proteinChangesSorted.length - 1]
        );
    }

    // remove longest common starting substring from all protein change values
    const proteinChangesTrimmed = proteinChanges.map(p => p.substring(startStr.length));

    // construct label (sorted by protein change count, not alphabetically)
    let label = startStr + proteinChangesTrimmed.join("/");

    if (proteinChanges.length < mutationCountsByProteinChange.length) {
        label = `${label} and ${mutationCountsByProteinChange.length - proteinChanges.length} more`;
    }

    return label;
}

export function lollipopLabelTextAnchor(labelText: string,
                                        codon: number,
                                        fontFamily: string,
                                        fontSize: number,
                                        geneWidth: number,
                                        proteinLength: number): string
{
    let anchor = "middle";
    const approxLabelWidth = getTextWidth(labelText, fontFamily, `${fontSize}px`);
    const lollipopDistanceToOrigin = codon * (geneWidth / proteinLength);
    const lollipopDistanceToXMax = geneWidth - lollipopDistanceToOrigin;

    // if lollipop is too close to the origin, in order to prevent label overlap set anchor to "start"
    if (approxLabelWidth / 2 > lollipopDistanceToOrigin) {
        anchor = "start";
    }
    // if lollipop is too close to the end of the protein, in order to prevent overflow set anchor to "end"
    else if (approxLabelWidth / 2 > lollipopDistanceToXMax) {
        anchor = "end";
    }

    return anchor;
}

export function getYAxisMaxSliderValue(event: any, countRange: [number, number])
{
    const inputValue: string = (event.target as HTMLInputElement).value;
    const value = parseInt(inputValue, 10);

    return value < countRange[0] ? countRange[0] : value;
}

export function getYAxisMaxInputValue(input: string, countRange: [number, number])
{
    const value = parseInt(input, 10);
    return value < countRange[0] ? countRange[0] : value;
}

export function calcCountRange(lollipops: LollipopSpec[]): [number, number]
{
    if (lollipops.length === 0) {
        return [0,0];
    } else {
        let max = 5;
        let min = 1;
        for (const lollipop of lollipops) {
            max = Math.max(max, lollipop.count);
            min = Math.min(min, lollipop.count);
        }
        return [min, max];
    }
}
