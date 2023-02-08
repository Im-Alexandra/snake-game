import { ref, watchEffect } from "vue";

import { db } from "../firebase/config";
import { collection, onSnapshot } from "firebase/firestore";

const getCollection = (c) => {
  const documents = ref(null);

  //colection ref
  let colRef = collection(db, c);

  const unsub = onSnapshot(
    colRef,
    (snapshot) => {
      let results = [];
      snapshot.docs.forEach((doc) => {
        results.push({ ...doc.data(), id: doc.id });
      });
      documents.value = results;
    },
    (error) => {
      console.log(error);
    }
  );

  watchEffect((onInvalidate) => {
    onInvalidate(() => unsub());
  });

  return { documents };
};

export default getCollection;
