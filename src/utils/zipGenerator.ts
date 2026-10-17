import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../data/androidProjectSource';

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Adicionar todos os arquivos do projeto com seus caminhos exatos
  for (const file of ANDROID_PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  // Adicionar arquivos adicionais do wrapper do Gradle para conveniência
  zip.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  zip.file(
    'gradlew',
    `#!/bin/sh
# Gradle start up script for POSIX systems
exec gradle "$@"
`
  );

  zip.file(
    'gradlew.bat',
    `@rem Gradle start up script for Windows
@gradle %*
`
  );

  zip.file(
    'app/proguard-rules.pro',
    `# Regras Proguard para Breno Battery
-keep class com.brenobattery.app.** { *; }
`
  );

  // Gerar o arquivo ZIP como Blob
  const blob = await zip.generateAsync({ type: 'blob' });

  // Disparar o download no navegador
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'BrenoBattery-Android-Kotlin-Project.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
