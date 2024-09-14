import { getDoc, doc } from "@firebase/firestore/lite";
import { db } from './main';

export async function getThisDayEvents(day) {
    const daysRef = doc(db, `days/${day}`);
    const docSnap = await getDoc(daysRef); // Corrected variable name

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log("No such document!");
        return null;
    }
}

export const getFormatedDate = (day) => {
    return `${day.getDate()}${day.getMonth() + 1}${day.getFullYear()}`;
}